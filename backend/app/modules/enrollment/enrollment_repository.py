from app.database.mongodb import db
from bson import ObjectId


class EnrollmentRepository:

    def __init__(self):
        self.collection = db.enrollments

    def count_by_course(self, course_id: str):
        return self.collection.count_documents({
            "course_id": ObjectId(course_id)
        })