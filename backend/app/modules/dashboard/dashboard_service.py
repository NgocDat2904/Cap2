from app.database.mongodb import db
from app.modules.user.user_repository import get_user_by_id
from bson import ObjectId


class DashboardService:

    async def get_instructor_dashboard(self, instructor_id: str):

        # ======================
        # ACTIVE COURSES
        # ======================
        active_courses = list(db.courses.find({
            "instructor_id": ObjectId(instructor_id),
            "status": "APPROVED",
            "is_deleted": {"$ne": True},  # 🔥 FIX: Loại bỏ khóa đã xóa
            "is_archived": {"$ne": True}  # 🔥 FIX: Loại bỏ khóa đã lưu trữ
        }))

        active_course_count = len(active_courses)

        course_ids = [c["_id"] for c in active_courses]

        # ======================
        # TOTAL LESSONS
        # ======================
        total_lessons = db.lessons.count_documents({
            "course_id": {"$in": course_ids}
        })

        # ======================
        # ENROLLED STUDENTS
        # ======================
        enrolled_students = db.enrollments.count_documents({
            "course_id": {"$in": course_ids}
        })

        # ======================
        # TOTAL Q&A
        # ======================
        total_questions = db.questions.count_documents({
            "course_id": {"$in": course_ids}
        })

        # ======================
        # STUDENT CHART
        # ======================
        student_chart = []

        for month in range(1, 13):

            count = db.enrollments.count_documents({
                "course_id": {"$in": course_ids},
                "$expr": {
                    "$eq": [
                        {"$month": "$created_at"},
                        month
                    ]
                }
            })

            student_chart.append({
                "month": month,
                "students": count
            })

        # ======================
        # LATEST Q&A
        # ======================
        latest_qa = []

        # 🔥 FIX: Chỉ query nếu có courses
        if course_ids:
            # 🔥 FIX: Lấy nhiều hơn 3 để đề phòng có questions bị skip do content empty
            # Query 10 questions, filter content valid, rồi lấy 3 cái đầu
            latest_questions = list(
                db.questions.find({
                    "course_id": {"$in": course_ids},
                    "type": "question",  # Chỉ lấy câu hỏi, không lấy reply
                    "content": {"$exists": True, "$ne": "", "$ne": None}  # 🔥 FIX: Chỉ lấy Q&A có content
                })
                .sort("created_at", -1)
                .limit(10)  # 🔥 Lấy 10 để đảm bảo đủ 3 sau khi filter
            )

            for q in latest_questions:
                # Double check content (defense in depth)
                content = q.get("content")
                if not content or not content.strip():
                    continue

                learner = get_user_by_id(str(q.get("user_id")))

                course = db.courses.find_one({
                    "_id": q.get("course_id")
                })

                # Format date to ISO string (frontend sẽ tự format)
                created_at = q.get("created_at")
                date_str = ""
                if created_at:
                    try:
                        # Trả về ISO 8601 string với Z (UTC)
                        if hasattr(created_at, 'isoformat'):
                            date_str = created_at.isoformat() + "Z"
                        else:
                            date_str = str(created_at)
                    except:
                        date_str = str(created_at)

                latest_qa.append({
                    "id": str(q["_id"]),
                    "question": content.strip(),
                    "course": course.get("title") if course else "Khóa học chưa xác định",
                    "name": learner.get("fullName") if learner else "Học viên ẩn danh",
                    "date": date_str,
                    "avatar": learner.get("avatar_url") if learner else None
                })

                # 🔥 FIX: Dừng lại khi đã đủ 3 Q&A
                if len(latest_qa) >= 3:
                    break

        # ======================
        # POPULAR COURSES
        # ======================
        popular_courses = []

        for course in active_courses:

            enroll_count = db.enrollments.count_documents({
                "course_id": course["_id"]
            })

            revenue = enroll_count * float(course.get("price", 0))

            popular_courses.append({
                "id": str(course["_id"]),
                "title": course.get("title"),
                "thumbnail": course.get("image"),
                "students": enroll_count,
                "revenue": revenue
            })

        popular_courses = sorted(
            popular_courses,
            key=lambda x: x["students"],
            reverse=True
        )[:5]

        return {
            "active_courses": active_course_count,
            "total_lessons": total_lessons,
            "enrolled_students": enrolled_students,
            "total_questions": total_questions,
            "student_chart": student_chart,
            "latest_qa": latest_qa,
            "popular_courses": popular_courses
        }


dashboard_service = DashboardService()