from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime

from app.modules.video.video_repository import VideoRepository
from app.modules.video.video_schema import VideoRequest
from app.database.mongodb import db
from app.storage.gcs_client import GCSClient
from app.modules.ai.stt_service import transcribe_from_video_url
import cv2
from urllib.parse import quote


video_repository = VideoRepository()
gcs_client = GCSClient()


class VideoService:

    # ===================== UPLOAD =====================

    async def generate_transcript(
        self,
        video_id: str,
        instructor_id: str,
        language: str = "vi",
        force: bool = False,
):

        if not ObjectId.is_valid(video_id):
            raise HTTPException(400, "Invalid video_id")

        video_doc = db.videos.find_one({
            "_id": ObjectId(video_id)
    })

        if not video_doc:
            raise HTTPException(404, "Video not found")

    # =========================
    # CHECK COURSE
    # =========================
        course = db.courses.find_one({
            "_id": video_doc["course_id"]
    })

        if not course:
            raise HTTPException(404, "Course not found")

        if str(course["instructor_id"]) != instructor_id:
            raise HTTPException(403, "Not your course")

    # =========================
    # CHECK EXISTING TRANSCRIPT
    # =========================
        current = (
            video_doc.get("transcript") or ""
        ).strip()

        if current and not force:
            return {
                "video_id": video_id,
                "status": "already_exists",
                "message": "Transcript đã tồn tại. Dùng force=true để ghi đè.",
        }

    # =========================
    # GET VIDEO URL
    # =========================
        video_url = (
            video_doc.get("video_url") or ""
        ).strip()

    # ưu tiên signed URL từ GCS
        if video_doc.get("storage_path"):

            try:

                raw_url = gcs_client.generate_read_signed_url(
                    video_doc["storage_path"]
            )

            # ✅ FIX URL encode
                video_url = quote(
                   raw_url,
                   safe=":/?=&"
            )

                print("✅ Encoded URL:", video_url)

            except Exception as e:

                print("❌ Signed URL error:", e)

            video_url = ""

        if not video_url:
            raise HTTPException(
            400,
            "Video chưa có URL để STT"
        )

    # =========================
    # UPDATE STATUS
    # =========================
        db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {
                "$set": {
                    "transcript_status": "processing",
                    "ai_status": "processing",
                    "updated_at": datetime.utcnow(),
            }
        },
    )

    # =========================
    # GENERATE TRANSCRIPT
    # =========================
        try:

            print("🚀 Start transcript generation")

            transcript, segments = transcribe_from_video_url(
                video_url,
                language=language
        )

            print("✅ Transcript generated")

            db.videos.update_one(
                {"_id": ObjectId(video_id)},
            {
                    "$set": {
                        "transcript": transcript,
                        "transcript_segments": segments,

                        "transcript_status": "completed",

                    # AI
                        "ai_status": "ready",
                        "ai_cache": {},

                        "updated_at": datetime.utcnow(),
                }
            },
        )

            return {
                "video_id": video_id,
                "status": "completed",
                "transcript_length": len(transcript),
                "segment_count": len(segments),
        }

        except Exception as e:

            print("❌ Transcript generation failed:", e)

        db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {
                "$set": {
                    "transcript_status": "failed",
                    "ai_status": "failed",
                    "ai_error": str(e),
                    "updated_at": datetime.utcnow(),
                }
            },
        )

        raise HTTPException(
            500,
            f"Transcript generation failed: {e}"
        )

    # ===================== TRANSCRIPT =====================

    async def generate_transcript(
        self,
        video_id: str,
        instructor_id: str,
        language: str = "vi",
        force: bool = False,
):

    # =====================================================
    # VALIDATE VIDEO ID
    # =====================================================

        if not ObjectId.is_valid(video_id):
            raise HTTPException(
                400,
                "Invalid video_id"
        )

        video_doc = db.videos.find_one(
            {"_id": ObjectId(video_id)}
    )

        if not video_doc:
            raise HTTPException(
                404,
               "Video not found"
        )

    # =====================================================
    # CHECK COURSE OWNERSHIP
    # =====================================================

        course = db.courses.find_one(
            {"_id": video_doc["course_id"]}
    )

        if not course:
            raise HTTPException(
                404,
                "Course not found"
        )

        if str(course["instructor_id"]) != instructor_id:
            raise HTTPException(
                403,
               "Not your course"
        )

    # =====================================================
    # CHECK EXISTING TRANSCRIPT
    # =====================================================

        current = (
            video_doc.get("transcript") or ""
    ).strip()

        if current and not force:

            return {
            "video_id": video_id,
            "status": "already_exists",
            "message": (
                "Transcript đã tồn tại. "
                "Dùng force=true để ghi đè."
            ),
        }

    # =====================================================
    # 🚀 ALWAYS USE SIGNED URL
    # =====================================================

        video_url = None

        if video_doc.get("storage_path"):

            try:

                video_url = (
                    gcs_client.generate_read_signed_url(
                        video_doc["storage_path"]
                )
            )

                print("✅ USING SIGNED URL")

                print(video_url)

            except Exception as e:

                print(
                "❌ Signed URL error:",
                str(e)
            )

                video_url = None

        if not video_url:

            raise HTTPException(
                400,
                "Video chưa có signed URL"
        )

    # =====================================================
    # UPDATE STATUS
    # =====================================================

        db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {
                "$set": {
                    "ai_status": "processing",
                    "updated_at": datetime.utcnow(),
            }
        },
    )

    # =====================================================
    # GENERATE TRANSCRIPT
    # =====================================================

        try:

            transcript, segments = (
                transcribe_from_video_url(
                    video_url,
                    language=language,
            )
        )

        # =================================================
        # SAVE RESULT
        # =================================================

            db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {
                    "$set": {

                        "transcript": transcript,

                        "transcript_segments": segments,

                        "transcript_status": "completed",

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

            print("❌ TRANSCRIPT ERROR:", str(e))

            db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {
                    "$set": {

                        "ai_status": "failed",

                        "transcript_status": "failed",

                        "ai_error": str(e),

                        "updated_at": datetime.utcnow(),
                }
            },
        )

            raise HTTPException(
                500,
                f"Transcript generation failed: {e}"
        )
        
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


video_service = VideoService()
    