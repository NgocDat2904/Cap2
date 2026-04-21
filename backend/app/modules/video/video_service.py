from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime

from app.modules.video.video_repository import VideoRepository
from app.modules.video.video_schema import VideoRequest
from app.database.mongodb import db
from app.storage.gcs_client import GCSClient
from app.modules.ai.stt_service import transcribe_from_video_url


video_repository = VideoRepository()
gcs_client = GCSClient()


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
            raise HTTPException(400, "Cần url hoặc storage_path")

        # ===================== BUILD DATA =====================

        doc = {
            "lesson_id": ObjectId(data.lesson_id),
            "course_id": course["_id"],   # 🔥 QUAN TRỌNG

            "video_url": data.video_url,
            "storage_path": data.storage_path,

            # 🔥 UI DATA
            "title": data.title or lesson.get("title"),
            "description": data.description,

            "thumbnail_url": data.thumbnail_url,
            "image": data.image or data.thumbnail_url,

            "duration": data.duration or "10:00",
            "views": data.views or 0,
            "transcript": data.transcript,
            "transcript_segments": [],
            "ai_status": "ready" if (data.transcript and data.transcript.strip()) else "pending",
            "ai_cache": {},

            "created_at": datetime.utcnow(),
        }

        return video_repository.create(doc)

    # ===================== TRANSCRIPT =====================

    async def generate_transcript(
        self,
        video_id: str,
        instructor_id: str,
        language: str = "vi",
        force: bool = False,
    ):
        if not ObjectId.is_valid(video_id):
            raise HTTPException(400, "Invalid video_id")

        video_doc = db.videos.find_one({"_id": ObjectId(video_id)})
        if not video_doc:
            raise HTTPException(404, "Video not found")

        # Ownership check: instructor chỉ xử lý video của khóa mình
        course = db.courses.find_one({"_id": video_doc["course_id"]})
        if not course:
            raise HTTPException(404, "Course not found")
        if str(course["instructor_id"]) != instructor_id:
            raise HTTPException(403, "Not your course")

        current = (video_doc.get("transcript") or "").strip()
        if current and not force:
            return {
                "video_id": video_id,
                "status": "already_exists",
                "message": "Transcript đã tồn tại. Dùng force=true để ghi đè.",
            }

        video_url = video_doc.get("video_url")
        if not video_url and video_doc.get("storage_path"):
            try:
                video_url = gcs_client.generate_read_signed_url(video_doc["storage_path"])
            except Exception:
                video_url = None

        if not video_url:
            raise HTTPException(400, "Video chưa có URL để STT")

        db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": {"ai_status": "processing", "updated_at": datetime.utcnow()}},
        )

        try:
            transcript, segments = transcribe_from_video_url(video_url, language=language)
            db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {
                    "$set": {
                        "transcript": transcript,
                        "transcript_segments": segments,
                        "ai_status": "ready",
                        "ai_cache": {},
                        "updated_at": datetime.utcnow(),
                    }
                },
            )
            return {
                "video_id": video_id,
                "status": "ready",
                "transcript_length": len(transcript),
                "segment_count": len(segments),
            }
        except Exception as e:
            db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {
                    "$set": {
                        "ai_status": "failed",
                        "ai_error": str(e),
                        "updated_at": datetime.utcnow(),
                    }
                },
            )
            raise HTTPException(500, f"Transcript generation failed: {e}")