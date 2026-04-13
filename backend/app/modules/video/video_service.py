from bson import ObjectId
from fastapi import HTTPException

from app.modules.video.video_repository import VideoRepository
from app.modules.video.video_schema import VideoRequest
from app.database.mongodb import db


video_repository = VideoRepository()


class VideoService:

    async def save_video(self, data: VideoRequest, instructor_id: str):

        # 🔥 1. Validate lesson_id
        if not data.lesson_id:
            raise HTTPException(400, "lesson_id is required")

        if not ObjectId.is_valid(data.lesson_id):
            raise HTTPException(400, "Invalid lesson_id")

        lesson = await db.lessons.find_one({
            "_id": ObjectId(data.lesson_id)
        })

        if not lesson:
            raise HTTPException(404, "Lesson not found")

        # 🔥 2. Validate ownership
        section = await db.sections.find_one({
            "_id": lesson["section_id"]
        })

        course = await db.courses.find_one({
            "_id": section["course_id"]
        })

        if str(course["instructor_id"]) != instructor_id:
            raise HTTPException(403, "Not your course")

        # 🔥 3. Validate video data
        if not data.video_url and not data.storage_path:
            raise HTTPException(
                400,
                "Cần url hoặc storage_path",
            )

        # 🔥 4. Insert
        doc = {
            "lesson_id": ObjectId(data.lesson_id),
            "video_url": data.video_url,
            "storage_path": data.storage_path,
        }

        return await video_repository.create(doc)