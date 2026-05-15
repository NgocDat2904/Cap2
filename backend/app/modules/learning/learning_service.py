from bson import ObjectId
from datetime import datetime

from app.database.mongodb import db

from .learning_repository import LearningRepository

from app.modules.user.user_repository import (
    get_user_by_id
)

repo = LearningRepository()


class LearningService:

    # ======================
    # ENROLL COURSE
    # ======================
    async def enroll(
        self,
        course_id: str,
        user_id: str
    ):

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

                "message": (
                    "You already enrolled this course"
                ),

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

            repo.enroll(
                course_id,
                user_id
            )

            return {

                "success": True,

                "message": (
                    "Enrolled successfully"
                ),

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
    async def get_my_courses(
        self,
        user_id: str
    ):

        enrollments = repo.get_user_enrollments(
            user_id
        )

        course_ids = [

            e["course_id"]

            for e in enrollments
        ]

        courses = list(

            db.courses.find({

                "_id": {
                    "$in": course_ids
                },
                "is_deleted": {"$ne": True}
            })
        )

        result = []

        for c in courses:

            cid = str(c["_id"])

            # ======================
            # TOTAL LESSONS
            # ======================

            total_lessons = repo.count_lessons(
                cid
            )

            # ======================
            # COMPLETED LESSONS
            # ======================

            completed_lessons = (
                repo.count_completed_lessons(
                    cid,
                    user_id
                )
            )

            # ======================
            # PROGRESS %
            # ======================

            progress_percent = 0

            if total_lessons > 0:

                progress_percent = int(

                    (
                        completed_lessons
                        / total_lessons
                    ) * 100
                )

            # ======================
            # STATUS
            # ======================

            if progress_percent == 0:

                status = "not_started"

            elif progress_percent == 100:

                status = "completed"

            else:

                status = "in_progress"

            # ======================
            # LAST ACCESS
            # ======================

            last_access = repo.get_last_access(
                cid,
                user_id
            )

            # ======================
            # INSTRUCTOR
            # ======================

            instructor_name = (
                "Giảng viên EduSync"
            )

            iid = c.get("instructor_id")

            if iid:

                user = get_user_by_id(
                    str(iid)
                )

                if user:

                    instructor_name = (

                        user.get("fullName")

                        or user.get("email")
                    )

            # ======================
            # APPEND RESULT
            # ======================

            result.append({

                "id": cid,

                "title": c.get("title"),

                "thumbnail": c.get("image"),

                "price": c.get("price", 0),

                "instructor": instructor_name,

                "is_enrolled": True,

                # ======================
                # PROGRESS
                # ======================

                "progress_percent": (
                    progress_percent
                ),

                "completed_lessons": (
                    completed_lessons
                ),

                "total_lessons": (
                    total_lessons
                ),

                "status": status,

                # ======================
                # LAST ACCESS
                # ======================

                "last_accessed": (

                    str(
                        last_access.get(
                            "updated_at"
                        )
                    )

                    if last_access
                    else None
                )
            })

        return result

    # ======================
    # COMPLETE LESSON
    # ======================
    async def complete_lesson(
        self,
        course_id: str,
        lesson_id: str,
        user_id: str
    ):

        lesson = db.lessons.find_one({

            "_id": ObjectId(lesson_id)
        })

        if not lesson:

            raise Exception(
                "Lesson not found"
            )

        repo.complete_lesson(

            course_id,

            lesson_id,

            user_id
        )

        return {

            "message": (
                "Lesson completed"
            )
        }

    # ======================
    # UPDATE PROGRESS
    # ======================
    async def update_progress(
        self,
        course_id: str,
        lesson_id: str,
        video_id: str,
        user_id: str,
        progress_seconds: int,
        duration: int
    ):

        lesson = db.lessons.find_one({

            "_id": ObjectId(lesson_id)
        })

        if not lesson:

            raise Exception(
                "Lesson not found"
            )

        # ======================
        # PROGRESS %
        # ======================

        progress_percent = 0

        if duration > 0:

            progress_percent = int(

                (
                    progress_seconds
                    / duration
                ) * 100
            )

        # ======================
        # COMPLETE
        # ======================

        is_completed = (

            progress_percent >= 90
        )

        # ======================
        # UPDATE DB
        # ======================

        repo.update_progress(

            course_id,

            lesson_id,

            video_id,

            user_id,

            progress_seconds,

            duration
        )

        return {

            "message": (
                "Progress updated"
            ),

            "progress_percent": (
                progress_percent
            ),

            "is_completed": (
                is_completed
            )
        }