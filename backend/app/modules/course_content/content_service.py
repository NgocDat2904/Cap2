from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException

from app.database.mongodb import db

# 🔥 IMPORT COURSE SERVICE
from app.modules.course.course_service import course_service
from app.modules.notifications.notification_repository import notification_repository


class ContentService:

    # ===================== CREATE LESSON =====================

    async def create_lesson(self, data, user_id):

        # =====================
        # VALIDATE INPUT
        # =====================

        if not data.get("course_id"):
            raise HTTPException(
                400,
                "course_id is required"
            )

        if not data.get("title"):
            raise HTTPException(
                400,
                "title is required"
            )

        if not ObjectId.is_valid(data["course_id"]):
            raise HTTPException(
                400,
                "Invalid course_id"
            )

        # =====================
        # CHECK COURSE
        # =====================

        course = db.courses.find_one({
            "_id": ObjectId(data["course_id"])
        })

        if not course:
            raise HTTPException(
                404,
                "Course not found"
            )

        # =====================
        # CHECK OWNER
        # =====================

        if str(course.get("instructor_id")) != user_id:
            raise HTTPException(
                403,
                "Not your course"
            )

        # =====================
        # CREATE LESSON
        # =====================

        lesson = {

            # 🔥 QUAN TRỌNG
            "course_id": ObjectId(data["course_id"]),

            "title": data["title"],

            "order_index": data.get(
                "order_index",
                1
            ),

            # 🔥 LESSON MỚI CHƯA CÓ VIDEO
            "duration": "0m",

            "created_at": datetime.utcnow()
        }

        result = db.lessons.insert_one(lesson)

        # =====================
        # 🔥 RECALCULATE COURSE DURATION
        # =====================

        await course_service.recalculate_course_duration(
            data["course_id"]
        )

        # =====================
        # 🔥 NOTIFY ENROLLED STUDENTS (only if course is published)
        # =====================
        if course.get("status") == "approved":
            # Get all enrolled students
            enrollments = list(db.enrollments.find({
                "course_id": ObjectId(data["course_id"])
            }))

            course_title = course.get("title", "khóa học")
            lesson_title = data["title"]

            # Create notification for each enrolled student
            for enrollment in enrollments:
                notification_repository.create({
                    "user_id": enrollment["user_id"],
                    "title": "Bài học mới được thêm!",
                    "message": f"Khóa học \"{course_title}\" vừa có bài học mới: \"{lesson_title}\". Học ngay để không bỏ lỡ!",
                    "type": "course_update",
                    "course_id": ObjectId(data["course_id"]),
                    "lesson_id": result.inserted_id,
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })

        # =====================
        # RESPONSE
        # =====================

        return {

            "message": "Lesson created",

            "id": str(result.inserted_id)
        }

    # ❌ REMOVE create_video
    # dùng VideoService