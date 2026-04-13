from bson import ObjectId
from app.database.mongodb import db


class VideoRepository:

    # ===================== CREATE =====================

    def create(self, data: dict):
        """
        Insert video vào DB
        """

        # Convert ObjectId
        if "lesson_id" in data and data["lesson_id"]:
            data["lesson_id"] = ObjectId(data["lesson_id"])

        if "course_id" in data and data["course_id"]:
            data["course_id"] = ObjectId(data["course_id"])

        result = db.videos.insert_one(data)
        return str(result.inserted_id)

    # ===================== GET BY LESSON =====================

    def get_by_lesson(self, lesson_id: str):
        """
        Lấy danh sách video theo lesson
        """
        videos = list(db.videos.find({
            "lesson_id": ObjectId(lesson_id)
        }))

        return [self._serialize(v) for v in videos]

    # ===================== DELETE =====================

    def delete(self, video_id: str):
        """
        Xóa video
        """
        result = db.videos.delete_one({
            "_id": ObjectId(video_id)
        })

        return result.deleted_count > 0

    # ===================== UPDATE =====================

    def update(self, video_id: str, data: dict):
        """
        Update metadata video
        """

        # Convert nếu có
        if "lesson_id" in data and data["lesson_id"]:
            data["lesson_id"] = ObjectId(data["lesson_id"])

        if "course_id" in data and data["course_id"]:
            data["course_id"] = ObjectId(data["course_id"])

        result = db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": data}
        )

        return result.modified_count > 0

    # ===================== GET ONE =====================

    def get_by_id(self, video_id: str):
        """
        Lấy 1 video theo id
        """
        video = db.videos.find_one({
            "_id": ObjectId(video_id)
        })

        return self._serialize(video) if video else None

    # ===================== HELPER =====================

    def _serialize(self, doc: dict):
        """
        Convert ObjectId -> string để trả về API
        """
        doc["_id"] = str(doc["_id"])

        if "lesson_id" in doc:
            doc["lesson_id"] = str(doc["lesson_id"])

        if "course_id" in doc:
            doc["course_id"] = str(doc["course_id"])

        return doc