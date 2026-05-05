from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from app.database.mongodb import db


class VideoRepository:

    # ===================== INTERNAL =====================

    def _to_object_id(self, value):
        """Convert to ObjectId safely"""
        if isinstance(value, ObjectId):
            return value
        if isinstance(value, str) and ObjectId.is_valid(value):
            return ObjectId(value)
        return None

    def _normalize(self, data: dict):
        """Clean + normalize input data"""
        data = dict(data)

        # Convert IDs safely
        lesson_id = self._to_object_id(data.get("lesson_id"))
        course_id = self._to_object_id(data.get("course_id"))

        if lesson_id:
            data["lesson_id"] = lesson_id
        if course_id:
            data["course_id"] = course_id

        # Clean URL
        data["video_url"] = (data.get("video_url") or "").strip()
        data["storage_path"] = (data.get("storage_path") or "").strip()

        # Defaults
        data.setdefault("views", 0)
        data.setdefault("duration", "10:00")
        data.setdefault("image", data.get("thumbnail_url"))
        data.setdefault("is_approved", True)
        data.setdefault("created_at", datetime.utcnow())

        return data

    # ===================== CREATE =====================

    def create(self, data: dict):
        try:
            data = self._normalize(data)

            if not data.get("lesson_id") or not data.get("course_id"):
                raise ValueError("lesson_id và course_id là bắt buộc")

            if not data.get("video_url") and not data.get("storage_path"):
                raise ValueError("Phải có video_url hoặc storage_path")

            result = db.videos.insert_one(data)
            return str(result.inserted_id)

        except Exception as e:
            print("❌ Create video error:", e)
            return None

    # ===================== GET BY LESSON =====================

    from bson import ObjectId

    def get_by_lesson(self, lesson_id):
        try:
        # 🔥 FIX QUAN TRỌNG
            oid = lesson_id if isinstance(lesson_id, ObjectId) else ObjectId(lesson_id)
            print("🔥 QUERY lesson_id:", oid)
            videos = list(
                db.videos.find({"lesson_id": oid})
                .sort("created_at", 1)
            )
            print("🔥 FOUND VIDEOS:", videos)

            return [self._serialize(v) for v in videos]

        except Exception as e:
            print("❌ Get by lesson error:", e)
            return []

    # ===================== GET BY COURSE =====================

    def get_by_course(self, course_id: str):
        try:
            oid = self._to_object_id(course_id)
            if not oid:
                return []

            videos = list(
                db.videos.find({"course_id": oid})
                .sort("created_at", 1)
            )

            return [self._serialize(v) for v in videos]

        except Exception as e:
            print("❌ Get by course error:", e)
            return []

    # ===================== DELETE =====================

    def delete(self, video_id: str):
        try:
            oid = self._to_object_id(video_id)
            if not oid:
                return False

            result = db.videos.delete_one({"_id": oid})
            return result.deleted_count > 0

        except Exception as e:
            print("❌ Delete video error:", e)
            return False

    # ===================== UPDATE =====================

    def update(self, video_id: str, data: dict):
        try:
            oid = self._to_object_id(video_id)
            if not oid:
                return False

            data = self._normalize(data)

            result = db.videos.update_one(
                {"_id": oid},
                {"$set": data}
            )

            return result.modified_count > 0

        except Exception as e:
            print("❌ Update video error:", e)
            return False

    # ===================== GET ONE =====================

    def get_by_id(self, video_id: str):
        try:
            oid = self._to_object_id(video_id)
            if not oid:
                return None

            video = db.videos.find_one({"_id": oid})
            return self._serialize(video) if video else None

        except Exception as e:
            print("❌ Get video by id error:", e)
            return None

    # ===================== SERIALIZE =====================

    def _serialize(self, doc: dict):
        if not doc:
            return None

        # 🔥 fallback cực quan trọng
        video_url = doc.get("video_url") or doc.get("storage_path") or ""

        return {
            "id": str(doc.get("_id")),
            "lesson_id": str(doc.get("lesson_id")) if doc.get("lesson_id") else None,
            "course_id": str(doc.get("course_id")) if doc.get("course_id") else None,

            "title": doc.get("title", ""),
            "description": doc.get("description"),

            # 🔥 PLAYER FIELD
            "video_url": video_url,
            "play_url": video_url,

            "storage_path": doc.get("storage_path", ""),

            "duration": doc.get("duration", "10:00"),
            "views": doc.get("views", 0),

            "thumbnail_url": doc.get("thumbnail_url") or doc.get("image", ""),

            "is_approved": doc.get("is_approved", True),
            "created_at": doc.get("created_at"),
        }