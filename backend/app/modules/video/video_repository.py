from app.database.mongodb import db


class VideoRepository:
    def __init__(self):
        self.collection = db.videos

    # ===================== CREATE =====================

    def create(self, data: dict):
        result = self.collection.insert_one(data)
        return str(result.inserted_id)

    # ===================== QUERY =====================

    def get_by_course(self, course_id: str):
        videos = list(
            self.collection.find({"course_id": course_id})
        )
        return videos