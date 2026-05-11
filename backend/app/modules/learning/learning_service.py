from bson import ObjectId
from datetime import datetime

from app.database.mongodb import db
from .learning_repository import LearningRepository
from app.modules.user.user_repository import get_user_by_id

repo = LearningRepository()


class LearningService:

    # ======================
    # ENROLL COURSE
    # ======================
    async def enroll(self, course_id: str, user_id: str):

        # ======================
        # CHECK COURSE
        # ======================

        course = repo.get_course(course_id)

        if not course:
            raise Exception("Course not found")

        # ======================
        # CHECK ENROLLED
        # ======================

        already_enrolled = repo.is_enrolled(
            course_id,
            user_id
        )

        if already_enrolled:

            return {
                "success": False,
                "message": "You already enrolled this course",
                "is_enrolled": True
            }

        # ======================
        # COURSE PRICE
        # ======================

        price = course.get("price", 0)

        # ======================
        # FREE COURSE
        # ======================

        if price == 0:

            repo.enroll(course_id, user_id)

            return {
                "success": True,
                "message": "Enrolled successfully",
                "payment_required": False,
                "is_enrolled": True
            }

        # ======================
        # PAID COURSE
        # ======================

        return {
            "success": True,
            "message": "Payment required",
            "payment_required": True,
            "is_enrolled": False,
            "course_id": course_id,
            "price": price
        }

    # ======================
    # MY COURSES
    # ======================
    async def get_my_courses(self, user_id: str):

        enrollments = repo.get_user_enrollments(user_id)

        course_ids = [
            e["course_id"]
            for e in enrollments
        ]

        courses = list(db.courses.find({
            "_id": {"$in": course_ids}
        }))

        result = []

        for c in courses:

            cid = str(c["_id"])

            total = repo.count_lessons(cid)

            completed = repo.count_completed_lessons(
                cid,
                user_id
            )

            progress = int(
                (completed / total) * 100
            ) if total > 0 else 0

            last = repo.get_last_access(
                cid,
                user_id
            )

            # ======================
            # INSTRUCTOR
            # ======================

            instructor_name = "Giảng viên EduSync"

            iid = c.get("instructor_id")

            if iid:

                user = get_user_by_id(str(iid))

                if user:
                    instructor_name = (
                        user.get("fullName")
                        or user.get("email")
                    )

            result.append({

                "id": cid,

                "title": c.get("title"),

                "image": c.get("image"),

                "price": c.get("price", 0),

                "is_enrolled": True,

                "instructor": instructor_name,

                "progress": progress,

                "completedLessons": completed,

                "totalLessons": total,

                "lastAccessed": (
                    str(last.get("updated_at"))
                    if last else None
                ),

                "status": (
                    "completed"
                    if progress == 100
                    else "learning"
                )
            })

        return result

    # ======================
    # COMPLETE LESSON
    # ======================
    async def complete_lesson(
        self,
        lesson_id: str,
        user_id: str
    ):

        lesson = db.lessons.find_one({
            "_id": ObjectId(lesson_id)
        })

        if not lesson:
            raise Exception("Lesson not found")

        repo.complete_lesson(
            lesson_id,
            user_id
        )

        return {
            "message": "Lesson completed"
        }

    # ======================
    # UPDATE PROGRESS
    # ======================
    async def update_progress(
        self,
        lesson_id: str,
        user_id: str,
        progress_seconds: int,
        duration: int
    ):

        lesson = db.lessons.find_one({
            "_id": ObjectId(lesson_id)
        })

        if not lesson:
            raise Exception("Lesson not found")

        is_completed = (
            progress_seconds >= duration * 0.9
        )

        repo.update_progress(
            lesson_id,
            user_id,
            progress_seconds,
            duration
        )

        return {
            "message": "Progress updated",
            "is_completed": is_completed
        }