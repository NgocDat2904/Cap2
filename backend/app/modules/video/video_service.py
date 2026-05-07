from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime

from app.modules.video.video_repository import VideoRepository
from app.database.mongodb import db
from app.storage.gcs_client import GCSClient
from app.modules.ai.stt_service import transcribe_from_video_url

import cv2
from urllib.parse import quote


video_repository = VideoRepository()
gcs_client = GCSClient()


class VideoService:

    # =====================================================
    # GENERATE UPLOAD URL
    # =====================================================
    async def generate_upload_url(
        self,
        filename: str,
        content_type: str,
):

        try:

            result = (
                gcs_client
                .generate_upload_signed_url(
                    object_name=filename,
                    content_type=content_type,
                )
            )

            return result

        except Exception as e:

            print(
                "❌ Generate upload URL failed:",
                str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Generate upload URL failed: {e}"
        )
        
        
    async def save_video(
        self,
        data,
        instructor_id: str
    ):

        try:

            lesson = db.lessons.find_one({
                "_id": ObjectId(data.lesson_id)
            })

            if not lesson:

                raise HTTPException(
                    status_code=404,
                    detail="Lesson not found"
                )

            video_doc = {

                "lesson_id":
                    ObjectId(data.lesson_id),

                "course_id":
                    lesson["course_id"],

                "video_url":
                    data.video_url,

                "storage_path":
                    data.storage_path,

                "thumbnail_url":
                    data.thumbnail_url,

                "title":
                    data.title,

                "description":
                    data.description,

                "file_name":
                    data.file_name,

                "duration":
                    data.duration,

                "uploaded_by":
                    ObjectId(instructor_id),

                "created_at":
                    datetime.utcnow(),

                "updated_at":
                    datetime.utcnow(),

                "transcript":
                    "",

                "transcript_status":
                    "pending",

                "ai_status":
                    "pending",
            }

            result = db.videos.insert_one(
                video_doc
            )

            print(
                "✅ Video saved to database"
            )

            return {

                "message":
                    "Video saved successfully",

                "id":
                    str(result.inserted_id),

                "video_url":
                    data.video_url,
            }

        except Exception as e:

            print(
                "❌ SAVE VIDEO ERROR:",
                str(e)
            )

            raise HTTPException(
                status_code=500,
                detail=f"Save video failed: {e}"
            )
        
    # =====================================================
    # GENERATE TRANSCRIPT
    # =====================================================

    async def generate_transcript(
        self,
        video_id: str,
        instructor_id: str,
        language: str = "vi",
        force: bool = False,
    ):

        # =================================================
        # VALIDATE VIDEO ID
        # =================================================

        if not ObjectId.is_valid(video_id):
            raise HTTPException(
                status_code=400,
                detail="Invalid video_id"
            )

        video_doc = db.videos.find_one({
            "_id": ObjectId(video_id)
        })

        if not video_doc:
            raise HTTPException(
                status_code=404,
                detail="Video not found"
            )

        # =================================================
        # CHECK COURSE
        # =================================================

        course =  db.courses.find_one({
            "_id": video_doc["course_id"]
        })

        if not course:
            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        if str(course["instructor_id"]) != instructor_id:
            raise HTTPException(
                status_code=403,
                detail="Not your course"
            )

        # =================================================
# CHECK EXISTING TRANSCRIPT
        # =================================================

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

        # =================================================
        # GENERATE SIGNED URL
        # =================================================

        video_url = ""

        if video_doc.get("storage_path"):

            try:

                raw_url = gcs_client.generate_read_signed_url(
                    video_doc["storage_path"]
                )

                # Encode URL
                video_url = raw_url

                print("✅ USING SIGNED URL")
                print(video_url)

            except Exception as e:

                print("❌ Signed URL error:", str(e))
                video_url = ""

        if not video_url:
            raise HTTPException(
                status_code=400,
                detail="Video chưa có signed URL"
            )

        # =================================================
        # UPDATE STATUS
        # =================================================

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

        # =================================================
        # GENERATE TRANSCRIPT
        # =================================================

        try:

            print("🚀 Start transcript generation")

            transcript, segments = transcribe_from_video_url(
                video_url,
                language=language,
            )

            print("✅ Transcript generated")

            # =============================================
            # SAVE RESULT
            # =============================================

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
                "status": "completed",
                "transcript_length": len(transcript),
                "segment_count": len(segments),
            }

        except Exception as e:

            print("❌ TRANSCRIPT ERROR:", str(e))

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
                status_code=500,
                detail=f"Transcript generation failed: {e}"
            )

    # =====================================================
    # GET VIDEO DURATION
    # =====================================================

    def get_video_duration(self, file_path):

        video = cv2.VideoCapture(file_path)

        fps = video.get(cv2.CAP_PROP_FPS)

        frame_count = video.get(cv2.CAP_PROP_FRAME_COUNT)

        if fps == 0:
            return 0

        duration = frame_count / fps

        return int(duration)

    # =====================================================
    # FORMAT TIME
    # =====================================================

    def _seconds_to_hhmm(self, seconds: int) -> str:

        m = seconds // 60

        s = seconds % 60

        return f"{m}:{str(s).zfill(2)}"


video_service = VideoService()