from bson import ObjectId
from bson.errors import InvalidId
from app.database.mongodb import db


class VideoRepository:

    # ===================== CREATE =====================

    def create(self, data: dict):
        try:
            # Convert ObjectId
            if data.get("lesson_id"):
                data["lesson_id"] = ObjectId(data["lesson_id"])

            if data.get("course_id"):
                data["course_id"] = ObjectId(data["course_id"])

            # 🔥 DEFAULT UI FIELD
            data.setdefault("views", 0)
            data.setdefault("duration", "10:00")
            data.setdefault("image", data.get("thumbnail_url"))

            result = db.videos.insert_one(data)
            return str(result.inserted_id)

        except Exception as e:
            print("❌ Create video error:", e)
            return None

    # ===================== GET BY LESSON =====================

    def get_by_lesson(self, lesson_id: str):
        try:
            videos = list(
                db.videos.find({
                    "lesson_id": ObjectId(lesson_id)
                }).sort("created_at", 1)
            )

            return [self._serialize(v) for v in videos]

        except (InvalidId, Exception) as e:
            print(" Get by lesson error:", e)
            return []

    # ===================== GET BY COURSE (NEW) =====================

    def get_by_course(self, course_id: str):
        try:
            videos = list(
                db.videos.find({
                    "course_id": ObjectId(course_id)
                }).sort("created_at", 1)
            )

            return [self._serialize(v) for v in videos]

        except (InvalidId, Exception) as e:
            print(" Get by course error:", e)
            return []

    # ===================== DELETE =====================

    def delete(self, video_id: str):
        try:
            result = db.videos.delete_one({
                "_id": ObjectId(video_id)
            })

            return result.deleted_count > 0

        except (InvalidId, Exception) as e:
            print(" Delete video error:", e)
            return False

    # ===================== UPDATE =====================

    def update(self, video_id: str, data: dict):
        try:
            if data.get("lesson_id"):
                data["lesson_id"] = ObjectId(data["lesson_id"])

            if data.get("course_id"):
                data["course_id"] = ObjectId(data["course_id"])

            result = db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {"$set": data}
            )

            return result.modified_count > 0

        except (InvalidId, Exception) as e:
            print(" Update video error:", e)
            return False

    # ===================== GET ONE =====================

    def get_by_id(self, video_id: str):
        try:
            video = db.videos.find_one({
                "_id": ObjectId(video_id)
            })

            return self._serialize(video) if video else None

        except (InvalidId, Exception) as e:
            print(" Get video by id error:", e)
            return None

    # ===================== HELPER =====================

    def _serialize(self, doc: dict):
        if not doc:
            return None

        new_doc = dict(doc)

        new_doc["_id"] = str(new_doc["_id"])

        if "lesson_id" in new_doc:
            new_doc["lesson_id"] = str(new_doc["lesson_id"])

        if "course_id" in new_doc:
            new_doc["course_id"] = str(new_doc["course_id"])

        return new_doc