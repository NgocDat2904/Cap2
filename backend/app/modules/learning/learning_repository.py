from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime


class LearningRepository:

    # ======================
    # GET COURSE
    # ======================
    def get_course(self, course_id):

        return db.courses.find_one({
            "_id": ObjectId(course_id)
        })

    # ======================
    # ENROLL
    # ======================
    def enroll(self, course_id, user_id):

        return db.enrollments.insert_one({

            "course_id": ObjectId(course_id),

            "user_id": ObjectId(user_id),

            "created_at": datetime.utcnow()
        })

    # ======================
    # CHECK ENROLLED
    # ======================
    def is_enrolled(self, course_id, user_id):

        enrollment = db.enrollments.find_one({

            "course_id": ObjectId(course_id),

            "user_id": ObjectId(user_id)
        })

        return enrollment is not None

    # ======================
    # USER ENROLLMENTS
    # ======================
    def get_user_enrollments(self, user_id):

        return list(
            db.enrollments.find({

                "user_id": ObjectId(user_id)
            })
        )

    # ======================
    # LESSON COUNT
    # ======================
    def count_lessons(self, course_id):

        return db.lessons.count_documents({

            "course_id": ObjectId(course_id)
        })

    # ======================
    # COMPLETED LESSONS
    # ======================
    def count_completed_lessons(
        self,
        course_id,
        user_id
    ):

        return db.lesson_progress.count_documents({

            "course_id": ObjectId(course_id),

            "user_id": ObjectId(user_id),

            "is_completed": True
        })

    # ======================
    # COMPLETE LESSON
    # ======================
    def complete_lesson(
        self,
        course_id,
        lesson_id,
        user_id
    ):

        db.lesson_progress.update_one(

            {
                "lesson_id": ObjectId(lesson_id),

                "user_id": ObjectId(user_id)
            },

            {
                "$set": {

                    "course_id": ObjectId(course_id),

                    "is_completed": True,

                    "progress_percent": 100,

                    "updated_at": datetime.utcnow()
                },

                "$setOnInsert": {

                    "created_at": datetime.utcnow()
                }
            },

            upsert=True
        )

    # ======================
    # UPDATE PROGRESS
    # ======================
    def update_progress(
        self,
        course_id,
        lesson_id,
        video_id,
        user_id,
        seconds,
        duration
    ):

        progress_percent = 0

        if duration > 0:

            progress_percent = int(
                (seconds / duration) * 100
            )

        db.lesson_progress.update_one(

            {
                "lesson_id": ObjectId(lesson_id),

                "user_id": ObjectId(user_id)
            },

            {
                "$set": {

                    "course_id": ObjectId(course_id),

                    "lesson_id": ObjectId(lesson_id),

                    "video_id": ObjectId(video_id),

                    "user_id": ObjectId(user_id),

                    "progress_seconds": seconds,

                    "duration_seconds": duration,

                    "progress_percent": progress_percent,

                    "is_completed": (
                        progress_percent >= 90
                    ),

                    "last_watched_at": datetime.utcnow(),

                    "updated_at": datetime.utcnow()
                },

                "$setOnInsert": {

                    "created_at": datetime.utcnow()
                }
            },

            upsert=True
        )   
    # ======================
    # GET LESSON PROGRESS
    # ======================
    def get_lesson_progress(
        self,
        lesson_id,
        user_id
    ):

        return db.lesson_progress.find_one({

            "lesson_id": ObjectId(lesson_id),

            "user_id": ObjectId(user_id)
        })

    # ======================
    # LAST ACCESS
    # ======================
    def get_last_access(
        self,
        course_id,
        user_id
    ):

        return db.lesson_progress.find_one(

            {
                "course_id": ObjectId(course_id),

                "user_id": ObjectId(user_id)
            },

            sort=[
                ("updated_at", -1)
            ]
        )