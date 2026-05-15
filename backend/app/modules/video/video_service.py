
from bson import ObjectId
from fastapi import BackgroundTasks, HTTPException
from datetime import datetime
import json

import asyncio

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

    async def save_video(self, data: VideoRequest, instructor_id: str, background_tasks: BackgroundTasks = None):

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

    # =====================  AUTO TRANSCRIPT (Background) =====================
        video_url = (data.video_url or "").strip()
        storage_path = (data.storage_path or "").strip()
        has_transcript = data.transcript and data.transcript.strip()

        if video_id and (video_url or storage_path) and not has_transcript and background_tasks:
            db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {"$set": {"ai_status": "processing"}},
            )
            background_tasks.add_task(
                self._background_generate_transcript,
                video_id=video_id,
                video_url=video_url,
                storage_path=storage_path,
                language="vi",
            )
            print(f"Background STT scheduled for video {video_id}")

        saved = db.videos.find_one({"_id": ObjectId(video_id)})

        return json.loads(json.dumps(saved, default=str))

    # ===================== BACKGROUND STT =====================

    def _background_generate_transcript(
        self,
        video_id: str,
        video_url: str,
        storage_path: str = "",
        language: str = "vi",
    ):
        print(f"[STT] Bắt đầu tạo transcript cho video {video_id}...")
        try:
            download_url = None

            if storage_path:
                try:
                    download_url = gcs_client.generate_read_signed_url(storage_path)
                    print(f" [STT] Dùng signed URL từ storage_path: {storage_path}")
                except Exception as e:
                    print(f" [STT] Không tạo được signed URL từ storage_path: {e}")

            if not download_url and video_url:
                object_name = gcs_client.object_name_from_public_url(video_url)
                if object_name:
                    try:
                        download_url = gcs_client.generate_read_signed_url(object_name)
                        print(f" [STT] Dùng signed URL từ video_url object: {object_name}")
                    except Exception as e:
                        print(f" [STT] Không tạo được signed URL từ video_url: {e}")

            if not download_url:
                download_url = video_url

            if not download_url:
                raise RuntimeError("Không có URL nào để tải video")

            transcript, segments = transcribe_from_video_url(download_url, language=language)
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
            print(f"[STT] Transcript sẵn sàng cho video {video_id} ({len(transcript)} chars, {len(segments)} segments)")

            # ===================== AUTO GENERATE MARKMAP MINDMAP =====================
            try:
                from app.modules.ai.gemini_service import generate_markmap_mindmap_sync
                from app.modules.ai.ai_schema import LessonContext

                video_doc = db.videos.find_one({"_id": ObjectId(video_id)})
                ctx = LessonContext(
                    title=video_doc.get("title", "Video lesson") if video_doc else "Video lesson",
                    description=video_doc.get("description", "") if video_doc else "",
                    transcript=transcript,
                )

                markmap_code = generate_markmap_mindmap_sync(ctx, "vi")

                if markmap_code and "Ý chính 1" not in markmap_code:
                    db.ai_mindmaps.update_one(
                        {"video_id": ObjectId(video_id), "language": "vi"},
                        {
                            "$set": {
                                "markmap_code": markmap_code,
                                "updated_at": datetime.utcnow(),
                            },
                            "$setOnInsert": {
                                "created_at": datetime.utcnow(),
                            },
                        },
                        upsert=True,
                    )
                    print(f"[MINDMAP] ✅ Markmap mindmap đã tạo thành công cho video {video_id}")
                else:
                    print(f"[MINDMAP] ⚠️ Gemini không khả dụng, mindmap chưa được tạo cho video {video_id} (thiếu GEMINI_API_KEY?)")
            except Exception as mindmap_err:
                print(f"[MINDMAP] ❌ Lỗi auto-generate mindmap cho video {video_id}: {mindmap_err}")

            # ===================== AUTO GENERATE SUMMARY =====================
            try:
                from app.modules.ai.gemini_service import summarize_lesson_sync

                summary_text = summarize_lesson_sync(ctx, "vi")

                if summary_text:
                    db.ai_summaries.update_one(
                        {"video_id": ObjectId(video_id), "language": "vi"},
                        {
                            "$set": {
                                "summary": summary_text,
                                "updated_at": datetime.utcnow(),
                            },
                            "$setOnInsert": {
                                "created_at": datetime.utcnow(),
                            },
                        },
                        upsert=True,
                    )
                    print(f"[SUMMARY]  Summary đã tạo thành công cho video {video_id}")
                else:
                    print(f"[SUMMARY] ⚠️ Gemini không khả dụng, summary chưa được tạo cho video {video_id}")
            except Exception as summary_err:
                print(f"[SUMMARY]  Lỗi auto-generate summary cho video {video_id}: {summary_err}")

            # ===================== AUTO GENERATE TIMELINE =====================
            try:
                from app.modules.ai.gemini_service import generate_timeline_json_sync

                timeline_items = generate_timeline_json_sync(ctx, "vi")

                if timeline_items:
                    db.videos.update_one(
                        {"_id": ObjectId(video_id)},
                        {
                            "$set": {
                                "ai_cache.timeline.vi": timeline_items,
                                "updated_at": datetime.utcnow(),
                            }
                        }
                    )
                    print(f"[TIMELINE] Timeline đã tạo thành công cho video {video_id}")
                else:
                    print(f"[TIMELINE] ⚠️ Gemini không khả dụng, timeline chưa được tạo cho video {video_id}")
            except Exception as timeline_err:
                print(f"[TIMELINE] ❌ Lỗi auto-generate timeline cho video {video_id}: {timeline_err}")

        except Exception as e:
            print(f"[STT] Lỗi tạo transcript cho video {video_id}: {e}")
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
    

    async def track_view(
        self,
        video_id: str,
        user_id: str,
        payload: dict
    ):

        watched_seconds = payload.get(
            "watched_seconds",
            0
        )

        completed = payload.get(
            "completed",
            False
        )
        print("WATCHED:", watched_seconds) 
        print("COMPLETED:", completed)


        view = db.video_views.find_one({
            "video_id": ObjectId(video_id),
            "user_id": ObjectId(user_id)
        })

    # ==================================
    # FIRST VIEW
    # ==================================

        if not view:

            if watched_seconds >= 10:

                db.video_views.insert_one({

                    "video_id":
                        ObjectId(video_id),

                    "user_id":
                        ObjectId(user_id),

                    "watch_count": 1,

                    "completed":
                        completed,

                    "created_at":
                        datetime.utcnow(),

                    "updated_at":
                        datetime.utcnow()
                })

            # ✅ increase total views

                result = db["videos"].update_one(
                    {
                        "_id":
                            ObjectId(video_id)
                    },
                    {
                        "$inc": {
                            "views": 1
                        }
                    }
                )
                print("VIDEO ID:", video_id)
                print("MATCHED:", result.matched_count) 
                print("MODIFIED:", result.modified_count)

                return {
                    "message":
                        "First view counted"
                }

            return {
                "message":
                    "Not enough watch time"
            }

    # ==================================
    # WATCH AGAIN (FULL VIDEO)
    # ==================================

        if completed:

            db.video_views.update_one(
                {
                    "_id": view["_id"]
                },
                {
                    "$inc": {
                        "watch_count": 1
                    },

                    "$set": {
                        "completed": True,

                        "updated_at":
                            datetime.utcnow()
                    }
                }
            )
            

        # ✅ increase total views again

            db["videos"].update_one(
                {
                    "_id":
                        ObjectId(video_id)
                },
                {
                    "$inc": {
                        "views": 1
                    }
                }
            )

            return {
                "message":
                    "Completed view counted"
            }

        return {
            "message":
                "Tracking..."
        }

    # ===================== DELETE VIDEO =====================

    async def delete_video(self, video_id: str, user_id: str, user_role: str):
        """
        Xóa video (hard delete)

        - Instructor: Chỉ xóa được video của khóa học mình
        - Admin: Xóa được tất cả videos
        """
        from fastapi import HTTPException

        # =====================
        # VALIDATE VIDEO ID
        # =====================
        if not ObjectId.is_valid(video_id):
            raise HTTPException(400, "Invalid video_id")

        # =====================
        # CHECK VIDEO TỒN TẠI
        # =====================
        video = db.videos.find_one({"_id": ObjectId(video_id)})

        if not video:
            raise HTTPException(404, "Video not found")

        course_id = video.get("course_id")

        if not course_id:
            raise HTTPException(400, "Video không có course_id")

        # =====================
        # CHECK PERMISSION
        # =====================
        course = db.courses.find_one({"_id": course_id})

        if not course:
            raise HTTPException(404, "Course not found")

        # Instructor chỉ xóa được video của khóa học mình
        if user_role == "instructor":
            if str(course.get("instructor_id")) != user_id:
                raise HTTPException(403, "Not your course")

        # Admin có thể xóa tất cả videos (không cần check)

        # =====================
        # XÓA VIDEO
        # =====================

        # 🔥 HARD DELETE video
        result = db.videos.delete_one({"_id": ObjectId(video_id)})

        if result.deleted_count == 0:
            raise HTTPException(500, "Failed to delete video")

        # =====================
        # XÓA VIDEO VIEWS
        # =====================
        db.video_views.delete_many({"video_id": ObjectId(video_id)})

        # =====================
        # XÓA AI CACHE (nếu có)
        # =====================
        db.ai_summaries.delete_many({"video_id": ObjectId(video_id)})
        db.ai_mindmaps.delete_many({"video_id": ObjectId(video_id)})

        # =====================
        # RECALCULATE COURSE DURATION
        # =====================
        # Import course_service để tránh circular import
        from app.modules.course.course_service import course_service
        await course_service.recalculate_course_duration(str(course_id))

        # =====================
        # RESPONSE
        # =====================
        return {
            "message": "Video deleted successfully",
            "video_id": video_id
        }

