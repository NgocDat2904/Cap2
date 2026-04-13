from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime

from app.modules.video.video_repository import VideoRepository
from app.modules.video.video_schema import VideoRequest
from app.database.mongodb import db
from app.storage.gcs_client import GCSClient   # 🔥 thêm dòng này


video_repository = VideoRepository()
gcs_client = GCSClient()   # 🔥 thêm dòng này


class VideoService:

    # ===================== UPLOAD =====================

    async def generate_upload_url(
        self,
        filename: str,
        content_type: str = "video/mp4",
    ):
        if not filename:
            raise HTTPException(400, "filename is required")

        try:
            return gcs_client.generate_signed_url(
                filename,
                content_type,
            )
        except Exception as e:
            print("🔥 GCS ERROR:", e)
            raise HTTPException(500, str(e))


    # ===================== CREATE =====================

    async def save_video(self, data: VideoRequest, instructor_id: str):

        # 🔥 1. Validate lesson_id
        if not data.lesson_id:
            raise HTTPException(400, "lesson_id is required")

        if not ObjectId.is_valid(data.lesson_id):
            raise HTTPException(400, "Invalid lesson_id")

        lesson = db.lessons.find_one({
            "_id": ObjectId(data.lesson_id)
        })

        if not lesson:
            raise HTTPException(404, "Lesson not found")

        # 🔥 2. Validate ownership
        section = db.sections.find_one({
            "_id": lesson["section_id"]
        })

        if not section:
            raise HTTPException(404, "Section not found")

        course = db.courses.find_one({
            "_id": section["course_id"]
        })

        if not course:
            raise HTTPException(404, "Course not found")

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
            "created_at": datetime.utcnow(),
        }

        return video_repository.create(doc)