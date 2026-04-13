from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from app.database.mongodb import db


class ContentService:

    # ===================== CREATE SECTION =====================

    async def create_section(self, data, user_id):

        if not ObjectId.is_valid(data["course_id"]):
            raise HTTPException(400, "Invalid course_id")

        section = {
            "course_id": ObjectId(data["course_id"]),
            "title": data["title"],
            "order_index": data.get("order_index", 1), 
            "created_at": datetime.utcnow()
        }

        result = db.sections.insert_one(section)
        return {"id": str(result.inserted_id)}

    # ===================== CREATE LESSON =====================

    async def create_lesson(self, data, user_id):

        if not ObjectId.is_valid(data["section_id"]):
            raise HTTPException(400, "Invalid section_id")

        lesson = {
            "section_id": ObjectId(data["section_id"]),
            "title": data["title"],
            "order_index": data["order_index"],
            "created_at": datetime.utcnow()
        }

        result = db.lessons.insert_one(lesson)
        return {"id": str(result.inserted_id)}

    # ===================== CREATE VIDEO =====================

    async def create_video(self, data, user_id):

        if not ObjectId.is_valid(data["lesson_id"]):
            raise HTTPException(400, "Invalid lesson_id")

        video = {
            "lesson_id": ObjectId(data["lesson_id"]),
            "video_url": data["video_url"],
            "created_at": datetime.utcnow()
        }

        result = db.videos.insert_one(video)
        return {"id": str(result.inserted_id)}