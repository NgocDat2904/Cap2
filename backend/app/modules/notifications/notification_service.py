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

            result.append({
                "id": str(n["_id"]),
                "title": n.get("title"),
                "message": n.get("message"),
                "type": n.get("type"),
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


notification_service = NotificationService()