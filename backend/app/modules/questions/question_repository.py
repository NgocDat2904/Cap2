from app.database.mongodb import db
from bson import ObjectId


class QuestionRepository:

    def create(self, data):
        result = db.questions.insert_one(data)
        return str(result.inserted_id)

    def get_by_course(self, course_id):
        return list(
            db.questions.find({
                "course_id": ObjectId(course_id)
            }).sort("created_at", -1)
        )

    def answer_question(self, question_id, answer):
        db.questions.update_one(
            {
                "_id": ObjectId(question_id)
            },
            {
                "$set": {
                    "answer": answer,
                    "is_answered": True
                }
            }
        )


question_repository = QuestionRepository()