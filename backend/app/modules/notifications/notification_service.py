from bson import ObjectId

from app.database.mongodb import db

from .notification_repository import (
    notification_repository
)


class NotificationService:

    async def get_my_notifications(
        self,
        user_id
    ):

        notifications = (
            notification_repository
            .get_user_notifications(
                ObjectId(user_id)
            )
        )

        result = []

        for n in notifications:
            # Fetch thông tin chi tiết để hiển thị nội dung notification
            course_name = None
            lesson_name = None
            lesson_id = None
            instructor_name = None
            student_name = None

            # Lấy thông tin khóa học
            if n.get("course_id"):
                course = db.courses.find_one({"_id": n["course_id"]})
                if course:
                    course_name = course.get("title") or course.get("name")

                    # Lấy instructor name từ course
                    if course.get("instructor_id"):
                        instructor = db.users.find_one({"_id": course["instructor_id"]})
                        if instructor:
                            instructor_name = instructor.get("name") or instructor.get("full_name") or instructor.get("email")

            # Lấy thông tin bài học (lesson)
            if n.get("lesson_id"):
                lesson = db.lessons.find_one({"_id": n["lesson_id"]})
                if lesson:
                    lesson_name = lesson.get("title") or lesson.get("name")
                    lesson_id = str(n["lesson_id"])
            elif n.get("video_id"):
                # Nếu có video_id thay vì lesson_id
                video = db.videos.find_one({"_id": n["video_id"]})
                if video:
                    lesson_name = video.get("title") or video.get("name")
                    lesson_id = str(n["video_id"])

            # Lấy thông tin học viên (cho new_enroll)
            if n.get("student_id"):
                student = db.users.find_one({"_id": n["student_id"]})
                if student:
                    student_name = student.get("name") or student.get("full_name") or student.get("email")

            # Tạo title và message cụ thể nếu chưa có
            notification_type = n.get("type", "system")
            title = n.get("title") or self._generate_title(notification_type, course_name, student_name)
            message = n.get("message") or self._generate_message(notification_type, course_name, lesson_name, instructor_name, student_name, n.get("rejection_reason"))

            result.append({
                "id": str(n["_id"]),
                "title": title,
                "message": message,
                "type": notification_type,
                "is_read": n.get("is_read", False),
                "created_at": n.get("created_at"),

                # IDs
                "course_id": str(n["course_id"]) if n.get("course_id") else None,
                "lesson_id": lesson_id,
                "question_id": str(n["question_id"]) if n.get("question_id") else None,
                "student_id": str(n["student_id"]) if n.get("student_id") else None,

                # Context information
                "course_name": course_name,
                "lesson_name": lesson_name,
                "lesson_title": lesson_name,  # Alias cho frontend
                "instructor_name": instructor_name,
                "student_name": student_name,
                "rejection_reason": n.get("rejection_reason"),
                "url": n.get("url")
            })

        return result

    def _generate_title(self, notification_type, course_name=None, student_name=None):
        """Tạo tiêu đề thông báo dựa trên type"""
        titles = {
            "question_reply": "💬 Phản hồi mới từ Giảng viên",
            "qna_reply": "💬 Phản hồi mới từ Giảng viên",
            "qa": "💬 Có câu hỏi mới",
            "qna": "💬 Có câu hỏi mới",
            "course_approved": "✅ Khóa học đã được duyệt!",
            "approval": "✅ Khóa học đã được duyệt!",
            "course_rejected": "❌ Khóa học cần chỉnh sửa",
            "rejection": "❌ Khóa học cần chỉnh sửa",
            "new_course": "🎉 Khóa học mới ra mắt!",
            "new_enroll": f"👤 {student_name or 'Học viên mới'} đã ghi danh",
            "course_update": "📢 Khóa học được cập nhật",
            "achievement": "🏆 Bạn đạt thành tích mới!",
            "gamification": "⭐ Phần thưởng mới!",
            "system": "🔔 Thông báo hệ thống",
            "payment_success": "💳 Thanh toán thành công!",
            "payment_failed": "⚠️ Thanh toán thất bại",
            "reminder": "⏰ Nhắc nhở học tập"
        }
        return titles.get(notification_type, "📬 Thông báo mới")

    def _generate_message(self, notification_type, course_name=None, lesson_name=None,
                         instructor_name=None, student_name=None, rejection_reason=None):
        """Tạo nội dung thông báo dựa trên type và context"""
        course_part = f'"{course_name}"' if course_name else "khóa học"
        lesson_part = f'"{lesson_name}"' if lesson_name else "bài học"
        instructor_part = instructor_name or "giảng viên"
        student_part = student_name or "Một học viên"

        messages = {
            "question_reply": f"{instructor_part} đã trả lời bình luận của bạn tại {lesson_part}. Nhấn để xem chi tiết.",
            "qna_reply": f"{instructor_part} đã trả lời bình luận của bạn tại {lesson_part}. Nhấn để xem chi tiết.",
            "qa": f"{student_part} vừa đặt câu hỏi tại {lesson_part}. Hãy phản hồi để hỗ trợ họ.",
            "qna": f"{student_part} vừa đặt câu hỏi tại {lesson_part}. Hãy phản hồi để hỗ trợ họ.",
            "course_approved": f"Chúc mừng! Khóa học {course_part} đã được phê duyệt và đang được xuất bản trên hệ thống.",
            "approval": f"Chúc mừng! Khóa học {course_part} đã được phê duyệt và đang được xuất bản trên hệ thống.",
            "course_rejected": f"Khóa học {course_part} {rejection_reason or 'cần chỉnh sửa'}. Vui lòng xem chi tiết phản hồi.",
            "rejection": f"Khóa học {course_part} {rejection_reason or 'cần chỉnh sửa'}. Vui lòng xem chi tiết phản hồi.",
            "new_course": f"Khóa học {course_part} vừa được thêm vào danh mục. Khám phá ngay!",
            "new_enroll": f"{student_part} vừa đăng ký học {course_part}. Chào đón họ!",
            "course_update": f"Khóa học {course_part} vừa có nội dung mới hoặc cập nhật quan trọng.",
            "achievement": "Chúc mừng! Bạn vừa hoàn thành một cột mốc quan trọng trong hành trình học tập.",
            "gamification": "Bạn vừa nhận được huy hiệu hoặc điểm thưởng. Xem ngay trong hồ sơ của bạn.",
            "system": "EduSync có thông báo quan trọng dành cho bạn. Vui lòng kiểm tra.",
            "payment_success": "Giao dịch của bạn đã được xử lý. Giờ bạn có thể truy cập khóa học đã mua.",
            "payment_failed": "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
            "reminder": "Đã lâu bạn chưa học bài! Hãy tiếp tục hành trình của mình nhé."
        }
        return messages.get(notification_type, "Bạn có một thông báo mới từ EduSync. Nhấn để xem chi tiết.")


notification_service = NotificationService()