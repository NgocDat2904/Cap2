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

        sections = list(db.sections.find({
        "course_id": ObjectId(course_id)
    }))

        section_ids = [s["_id"] for s in sections]

        lessons = list(db.lessons.find({
        "section_id": {"$in": section_ids}
    }))

        lesson_ids = [l["_id"] for l in lessons]

        return db.lesson_progress.count_documents({
        "lesson_id": {"$in": lesson_ids},
        "learner_id": ObjectId(user_id),
        "is_completed": True
    })

    # ======================
    # PROGRESS
    # ======================
    def complete_lesson(self, lesson_id, user_id):
        db.lesson_progress.update_one(
        {
            "lesson_id": ObjectId(lesson_id),
            "learner_id": ObjectId(user_id)
        },
        {
            "$set": {
                "is_completed": True,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )
        
    def update_progress(self, lesson_id, user_id, seconds, duration):
        db.lesson_progress.update_one(
        {
            "lesson_id": ObjectId(lesson_id),
            "learner_id": ObjectId(user_id)
        },
        {
            "$set": {
                "progress_seconds": seconds,
                "duration": duration,
                "updated_at": datetime.utcnow(),
                "is_completed": seconds >= duration * 0.9
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