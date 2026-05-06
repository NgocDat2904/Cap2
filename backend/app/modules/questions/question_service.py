from datetime import datetime
from bson import ObjectId

from app.database.mongodb import db
from app.modules.questions.question_repository import question_repository


class QuestionService:

    async def create_question(self, data, user_id):

        doc = {
            "course_id": ObjectId(data.course_id),
            "lesson_id": ObjectId(data.lesson_id),

            "user_id": ObjectId(user_id),

            "question": data.question,

            "answer": "",

            "is_answered": False,

            "created_at": datetime.utcnow()
        }

        return question_repository.create(doc)

    async def get_course_questions(self, course_id):

        questions = question_repository.get_by_course(course_id)

        result = []

        for q in questions:

            user = db.users.find_one({
                "_id": q["user_id"]
            })

            result.append({
                "id": str(q["_id"]),

                "question": q["question"],

                "answer": q.get("answer", ""),

                "is_answered": q.get("is_answered", False),

                "user": {
                    "name": user.get("fullName") if user else "Learner"
                },

                "created_at": q.get("created_at")
            })

        return result

    async def answer_question(self, question_id, answer):

        question_repository.answer_question(
            question_id,
            answer
        )

        return {
            "message": "Answered successfully"
        }


question_service = QuestionService()