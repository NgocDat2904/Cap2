from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from app.database.mongodb import db


class ContentService:

    # ===================== CREATE LESSON =====================

    async def create_lesson(self, data, user_id):

    # =====================
    # 🔥 VALIDATE INPUT
    # =====================

        if not data.get("course_id"):
            raise HTTPException(400, "course_id is required")

        if not data.get("title"):
            raise HTTPException(400, "title is required")

        if not ObjectId.is_valid(data["course_id"]):
            raise HTTPException(400, "Invalid course_id")

    # =====================
    # 🔥 CHECK COURSE
    # =====================

        course = db.courses.find_one({
            "_id": ObjectId(data["course_id"])
    })

        if not course:
            raise HTTPException(404, "Course not found")

    # =====================
    # 🔥 CHECK OWNER
    # =====================

        if str(course.get("instructor_id")) != user_id:
            raise HTTPException(403, "Not your course")

    # =====================
    # 🔥 CREATE LESSON
    # =====================

        lesson = {
        "course_id": ObjectId(data["course_id"]),   # 🔥 QUAN TRỌNG NHẤT
        "title": data["title"],
        "order_index": data.get("order_index", 1),
        "created_at": datetime.utcnow()
    }

        result = db.lessons.insert_one(lesson)

        return {
        "message": "Lesson created",
        "id": str(result.inserted_id)
    }

    # ❌ REMOVE create_video → dùng VideoService