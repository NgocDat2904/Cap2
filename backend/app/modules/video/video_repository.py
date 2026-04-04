from app.database.mongodb import db


class VideoRepository:

    def create(self, data: dict):
        result = db.videos.insert_one(data)
        return str(result.inserted_id)


    def get_by_course(self, course_id: str):
        videos = list(db.videos.find({"course_id": course_id}))
        return videos