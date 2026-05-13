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

    def _format_questions(self, questions):
        result = []
        for q in questions:
            user = db.users.find_one({"_id": q["user_id"]})
            replies = question_repository.get_replies(str(q["_id"]))
            reply_items = []
            for r in replies:
                reply_user = db.users.find_one({"_id": r["user_id"]})
                reply_items.append({
                    "id": str(r["_id"]),
                    "content": r["content"],
                    "type": r["type"],
                    "created_at": r.get("created_at"),
                    "user": {
                        "id": str(reply_user["_id"]) if reply_user else "",
                        "name": reply_user.get("fullName") if reply_user else "Unknown",
                        "avatar": reply_user.get("avatar_url") if reply_user else "",
                        "role": reply_user.get("role") if reply_user else ""
                    }
                })

            # Tìm thông tin bài học/video
            lesson_id_str = str(q.get("lesson_id")) if q.get("lesson_id") else ""
            lesson_title = "General Lesson"
            video_url = ""
            if lesson_id_str:
                try:
                    obj_id = ObjectId(lesson_id_str)
                    video = db.videos.find_one({"_id": obj_id})
                    if video:
                        lesson_title = video.get("title", "Untitled Video")
                        video_url = video.get("video_url") or video.get("play_url", "")
                    else:
                        lesson = db.lessons.find_one({"_id": obj_id})
                        if lesson:
                            lesson_title = lesson.get("title", "Untitled Lesson")
                except:
                    pass

            result.append({
                "id": str(q["_id"]),
                "lesson_id": lesson_id_str,
                "lesson_title": lesson_title,
                "video_url": video_url,
                "content": q["content"],
                "created_at": q.get("created_at"),
                "is_answered": len(reply_items) > 0,
                "user": {
                    "id": str(user["_id"]) if user else "",
                    "name": user.get("fullName") if user else "Unknown",
                    "avatar": user.get("avatar_url") if user else "",
                    "role": user.get("role") if user else ""
                },
                "replies": reply_items
            })
        return result

    async def get_course_questions(self, course_id):
        questions = question_repository.get_course_questions(course_id)
        return self._format_questions(questions)

    async def get_lesson_questions(self, lesson_id):
        questions = question_repository.get_lesson_questions(lesson_id)
        return self._format_questions(questions)

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

    # =====================================
    # DELETE QUESTION
    # =====================================

    async def delete_question(self, question_id, user_id, user_role):
        """
        Xóa câu hỏi (question).
        - Learner: Chỉ xóa được question của chính mình
        - Instructor: Xóa được tất cả question trong khóa học của mình
        """
        from fastapi import HTTPException

        # Kiểm tra question có tồn tại không
        question = db.questions.find_one({"_id": ObjectId(question_id)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        # PHÂN QUYỀN
        if user_role == "learner":
            # Learner chỉ xóa được question của chính mình
            if str(question["user_id"]) != str(user_id):
                raise HTTPException(status_code=403, detail="You can only delete your own questions")

        elif user_role == "instructor":
            # Instructor xóa được question trong khóa học của mình
            course = db.courses.find_one({"_id": question["course_id"]})
            if not course or str(course.get("instructor_id")) != str(user_id):
                raise HTTPException(status_code=403, detail="You can only delete questions in your courses")

        # Xóa tất cả replies của question này
        db.questions.delete_many({
            "parent_id": ObjectId(question_id)
        })

        # Xóa question
        db.questions.delete_one({"_id": ObjectId(question_id)})

        return {
            "message": "Question deleted successfully"
        }

    # =====================================
    # DELETE REPLY
    # =====================================

    async def delete_reply(self, reply_id, user_id, user_role):
        """
        Xóa reply (câu trả lời).
        - Learner: Chỉ xóa được reply của chính mình
        - Instructor: Xóa được tất cả reply trong khóa học của mình
        """
        from fastapi import HTTPException

        # Kiểm tra reply có tồn tại không
        reply = db.questions.find_one({"_id": ObjectId(reply_id)})
        if not reply:
            raise HTTPException(status_code=404, detail="Reply not found")

        # PHÂN QUYỀN
        if user_role == "learner":
            # Learner chỉ xóa được reply của chính mình
            if str(reply["user_id"]) != str(user_id):
                raise HTTPException(status_code=403, detail="You can only delete your own replies")

        elif user_role == "instructor":
            # Instructor xóa được reply trong khóa học của mình
            # Tìm question cha để lấy course_id
            question = db.questions.find_one({"_id": reply.get("parent_id")})
            if question:
                course = db.courses.find_one({"_id": question["course_id"]})
                if not course or str(course.get("instructor_id")) != str(user_id):
                    raise HTTPException(status_code=403, detail="You can only delete replies in your courses")

        # Xóa reply
        db.questions.delete_one({"_id": ObjectId(reply_id)})

        return {
            "message": "Reply deleted successfully"
        }


question_service = QuestionService()