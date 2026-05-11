from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime

from app.modules.video.video_repository import VideoRepository
from app.modules.video.video_schema import VideoRequest
from app.database.mongodb import db
from app.storage.gcs_client import GCSClient
from app.modules.ai.stt_service import transcribe_from_video_url
import cv2


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

    # ===================== VALIDATE LESSON =====================
        if not data.lesson_id:
            raise HTTPException(400, "lesson_id is required")

        if not ObjectId.is_valid(data.lesson_id):
            raise HTTPException(400, "Invalid lesson_id")

        lesson = db.lessons.find_one({
            "_id": ObjectId(data.lesson_id)
    })

        if not lesson:
            raise HTTPException(404, "Lesson not found")

    # ===================== GET COURSE (NO SECTION) =====================
        course_id = lesson.get("course_id")

        if not course_id:
            raise HTTPException(400, "Lesson chưa có course_id")

    # 🔥 FIX kiểu dữ liệu
        if isinstance(course_id, str):
            course_id = ObjectId(course_id)

        course = db.courses.find_one({
            "_id": course_id
    })

        if not course:
            raise HTTPException(404, "Course not found")

        if str(course["instructor_id"]) != instructor_id:
            raise HTTPException(403, "Not your course")

    # ===================== VALIDATE VIDEO =====================
        if not data.video_url and not data.storage_path:
            raise HTTPException(400, "Cần url hoặc storage_path")
    # ===================== 🔥 AUTO GET DURATION =====================
        duration_str = data.duration or "00:00"

    # ===================== BUILD DATA =====================
        doc = {
        "lesson_id": lesson["_id"],
        "course_id": course["_id"],

        "video_url": (data.video_url or "").strip(),
        "storage_path": (data.storage_path or "").strip(),

        # UI
        "title": data.title or lesson.get("title"),
        "description": data.description,

        "thumbnail_url": data.thumbnail_url,
        "image": data.image or data.thumbnail_url,

        "duration": duration_str,
        "views": data.views or 0,

        # AI
        "transcript": data.transcript,
        "transcript_segments": [],
        "ai_status": "ready" if (data.transcript and data.transcript.strip()) else "pending",
        "ai_cache": {},

        # 🔥 NEW
        "is_approved": True,

        "created_at": datetime.utcnow(),
    }

        video_id = video_repository.create(doc)

        if not video_id:
            raise HTTPException(500, "Save video failed")

        # AUTO GENERATE TRANSCRIPT
        try:
            await self.generate_transcript(
                video_id=video_id,
                instructor_id=instructor_id,
                language="vi",
                force=False,
            )
            
        except Exception as e:
                print("⚠️ Auto transcript failed:", e)

        return video_id

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
        
    def get_video_duration(file_path):
        video = cv2.VideoCapture(file_path)
        fps = video.get(cv2.CAP_PROP_FPS)
        frame_count = video.get(cv2.CAP_PROP_FRAME_COUNT)
        if fps == 0:
            return 0

        duration = frame_count / fps
        return int(duration)
    
    def _seconds_to_hhmm(self, seconds: int) -> str:
        m = seconds // 60
        s = seconds % 60
        return f"{m}:{str(s).zfill(2)}"
    