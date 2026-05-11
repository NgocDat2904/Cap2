from app.database.mongodb import db
from bson import ObjectId


class QuestionRepository:

    # =========================
    # CREATE
    # =========================

    def create(self, data):

        result = db.questions.insert_one(data)

        return str(result.inserted_id)

    # =========================
    # GET COURSE QUESTIONS
    # =========================

    def get_course_questions(self, course_id):

        return list(
            db.questions.find({
                "course_id": ObjectId(course_id),
                "type": "question"
            }).sort("created_at", -1)
        )

    # =========================
    # GET REPLIES
    # =========================

    def get_replies(self, question_id):

        return list(
            db.questions.find({
                "parent_id": ObjectId(question_id),
                "type": "reply"
            }).sort("created_at", 1)
        )


question_repository = QuestionRepository()