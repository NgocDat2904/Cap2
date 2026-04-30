from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime


class LearningRepository:

    # ======================
    # ENROLL
    # ======================
    def enroll(self, course_id, user_id):
        return db.enrollments.insert_one({
            "course_id": ObjectId(course_id),
            "learner_id": ObjectId(user_id),
            "created_at": datetime.utcnow()
        })

    def is_enrolled(self, course_id, user_id):
        return db.enrollments.find_one({
            "course_id": ObjectId(course_id),
            "learner_id": ObjectId(user_id)
        })

    def get_user_enrollments(self, user_id):
        return list(db.enrollments.find({
            "learner_id": ObjectId(user_id)
        }))

    # ======================
    # LESSON COUNT
    # ======================
    def count_lessons(self, course_id):
        sections = list(db.sections.find({
            "course_id": ObjectId(course_id)
        }))

        section_ids = [s["_id"] for s in sections]

        return db.lessons.count_documents({
            "section_id": {"$in": section_ids}
        })

    def count_completed_lessons(self, course_id, user_id):
        return db.lesson_progress.count_documents({
            "course_id": ObjectId(course_id),
            "learner_id": ObjectId(user_id),
            "is_completed": True
        })

    # ======================
    # PROGRESS
    # ======================
    def complete_lesson(self, lesson_id, course_id, user_id):
        db.lesson_progress.update_one(
            {
                "lesson_id": ObjectId(lesson_id),
                "learner_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "course_id": ObjectId(course_id),
                    "is_completed": True,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )

    def get_last_access(self, course_id, user_id):
        return db.lesson_progress.find_one(
            {
                "course_id": ObjectId(course_id),
                "learner_id": ObjectId(user_id)
            },
            sort=[("updated_at", -1)]
        )