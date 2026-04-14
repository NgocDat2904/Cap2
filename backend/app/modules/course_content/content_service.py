from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from app.database.mongodb import db


class ContentService:

    # ===================== CREATE SECTION =====================

    async def create_section(self, data, user_id):

        # 🔥 Validate input
        if not data.get("course_id"):
            raise HTTPException(400, "course_id is required")

        if not data.get("title"):
            raise HTTPException(400, "title is required")

        if not ObjectId.is_valid(data["course_id"]):
            raise HTTPException(400, "Invalid course_id")

        course = db.courses.find_one({
            "_id": ObjectId(data["course_id"])
        })

        if not course:
            raise HTTPException(404, "Course not found")

        # 🔥 CHECK OWNER
        if str(course["instructor_id"]) != user_id:
            raise HTTPException(403, "Not your course")

        section = {
            "course_id": ObjectId(data["course_id"]),
            "title": data["title"],
            "order_index": data.get("order_index", 1),
            "created_at": datetime.utcnow()
        }

        result = db.sections.insert_one(section)

        return {
            "message": "Section created",
            "id": str(result.inserted_id)
        }

    # ===================== CREATE LESSON =====================

    async def create_lesson(self, data, user_id):

        # 🔥 Validate input
        if not data.get("section_id"):
            raise HTTPException(400, "section_id is required")

        if not data.get("title"):
            raise HTTPException(400, "title is required")

        if not ObjectId.is_valid(data["section_id"]):
            raise HTTPException(400, "Invalid section_id")

        section = db.sections.find_one({
            "_id": ObjectId(data["section_id"])
        })

        if not section:
            raise HTTPException(404, "Section not found")

        # 🔥 CHECK OWNER
        course = db.courses.find_one({
            "_id": section["course_id"]
        })

        if not course:
            raise HTTPException(404, "Course not found")

        if str(course["instructor_id"]) != user_id:
            raise HTTPException(403, "Not your course")

        lesson = {
            "section_id": ObjectId(data["section_id"]),
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