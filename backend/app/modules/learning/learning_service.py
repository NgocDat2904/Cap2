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
        if repo.is_enrolled(course_id, user_id):
            return {"message": "Already enrolled"}

        repo.enroll(course_id, user_id)

        return {"message": "Enrolled successfully"}

    # ======================
    # MY COURSES
    # ======================
    async def get_my_courses(self, user_id: str):

        enrollments = repo.get_user_enrollments(user_id)
        course_ids = [e["course_id"] for e in enrollments]

        courses = list(db.courses.find({
            "_id": {"$in": course_ids}
        }))

        result = []

        for c in courses:
            cid = str(c["_id"])

            total = repo.count_lessons(cid)
            completed = repo.count_completed_lessons(cid, user_id)

            progress = int((completed / total) * 100) if total > 0 else 0

            last = repo.get_last_access(cid, user_id)

            # instructor
            instructor_name = "Giảng viên EduSync"
            iid = c.get("instructor_id")

            if iid:
                user = get_user_by_id(str(iid))
                if user:
                    instructor_name = user.get("fullName") or user.get("email")

            result.append({
                "id": cid,
                "title": c.get("title"),
                "image": c.get("image"),
                "instructor": instructor_name,
                "progress": progress,
                "completedLessons": completed,
                "totalLessons": total,
                "lastAccessed": str(last.get("updated_at")) if last else None,
                "status": "completed" if progress == 100 else "learning"
            })

        return result

    # ======================
    # COMPLETE LESSON (OPTIONAL)
    # ======================
    async def complete_lesson(self, lesson_id: str, user_id: str):

        lesson = db.lessons.find_one({
            "_id": ObjectId(lesson_id)
        })

        if not lesson:
            raise Exception("Lesson not found")

        # 🔥 FIX: bỏ course_id
        repo.complete_lesson(lesson_id, user_id)

        return {"message": "Lesson completed"}

    # ======================
    # 🔥 UPDATE PROGRESS (QUAN TRỌNG NHẤT)
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

        # 🔥 LOGIC QUAN TRỌNG
        is_completed = progress_seconds >= duration * 0.9

        db.lesson_progress.update_one(
            {
                "lesson_id": ObjectId(lesson_id),
                "learner_id": ObjectId(user_id)
            },
            {
                "$set": {
                    "progress_seconds": progress_seconds,
                    "duration": duration,
                    "is_completed": is_completed,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        return {
            "message": "Progress updated",
            "is_completed": is_completed
        }