from datetime import datetime
from bson import ObjectId

from app.database.mongodb import db

from app.modules.questions.question_repository import (
    question_repository
)

from app.modules.notifications.notification_repository import (
    notification_repository
)


class QuestionService:

    # =====================================
    # CREATE QUESTION
    # =====================================

    async def create_question(self, data, user_id):

        doc = {

            "course_id": ObjectId(data.course_id),

            "lesson_id": ObjectId(data.lesson_id),

            "user_id": ObjectId(user_id),

            "content": data.content,

            "type": "question",

            "parent_id": None,

            "created_at": datetime.utcnow()
        }

        question_id = question_repository.create(doc)

        # =====================================
        # 🔥 CREATE NOTIFICATION FOR INSTRUCTOR
        # =====================================

        course = db.courses.find_one({
            "_id": ObjectId(data.course_id)
        })

        if course:

            notification_repository.create({

                "user_id": course["instructor_id"],

                "title": "New question received",

                "message": "A learner asked a new question.",

                "type": "new_question",

                "course_id": ObjectId(data.course_id),

                "question_id": ObjectId(question_id),

                "is_read": False,

                "created_at": datetime.utcnow()
            })

        return {
            "message": "Question created",
            "question_id": question_id
        }

    # =====================================
    # GET COURSE QUESTIONS
    # =====================================

    async def get_course_questions(self, course_id):

        questions = question_repository.get_course_questions(
            course_id
        )

        result = []

        for q in questions:

            user = db.users.find_one({
                "_id": q["user_id"]
            })

            replies = question_repository.get_replies(
                str(q["_id"])
            )

            reply_items = []

            for r in replies:

                reply_user = db.users.find_one({
                    "_id": r["user_id"]
                })

                reply_items.append({

                    "id": str(r["_id"]),

                    "content": r["content"],

                    "type": r["type"],

                    "created_at": r.get("created_at"),

                    "user": {

                        "id": str(reply_user["_id"]),

                        "name": reply_user.get("fullName"),

                        "avatar": reply_user.get("avatar_url"),

                        "role": reply_user.get("role")
                    }
                })

            result.append({

                "id": str(q["_id"]),

                "content": q["content"],

                "created_at": q.get("created_at"),

                "is_answered": len(reply_items) > 0,

                "user": {

                    "id": str(user["_id"]),

                    "name": user.get("fullName"),

                    "avatar": user.get("avatar_url"),

                    "role": user.get("role")
                },

                "replies": reply_items
            })

        return result

    # =====================================
    # CREATE REPLY
    # =====================================

    async def create_reply(
        self,
        question_id,
        content,
        user_id
    ):

        question = db.questions.find_one({
            "_id": ObjectId(question_id)
        })

        if not question:
            raise Exception("Question not found")

        doc = {

            "course_id": question["course_id"],

            "lesson_id": question["lesson_id"],

            "user_id": ObjectId(user_id),

            "content": content,

            "type": "reply",

            "parent_id": ObjectId(question_id),

            "created_at": datetime.utcnow()
        }

        reply_id = question_repository.create(doc)

        # =====================================
        # 🔥 CREATE NOTIFICATION FOR LEARNER
        # =====================================

        notification_repository.create({

            "user_id": question["user_id"],

            "title": "Instructor replied to you",

            "message": "Your question has a new reply.",

            "type": "question_reply",

            "course_id": question["course_id"],

            "question_id": question["_id"],

            "is_read": False,

            "created_at": datetime.utcnow()
        })

        return {
            "message": "Reply created",
            "reply_id": reply_id
        }


question_service = QuestionService()