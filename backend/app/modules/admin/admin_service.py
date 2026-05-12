from bson import ObjectId
from fastapi import HTTPException

from app.database.mongodb import db

from .admin_repository import (
    admin_repository
)


class AdminService:

    # =====================================
    # GET ALL USERS
    # =====================================

    async def get_all_users(self):

        users = admin_repository.get_all_users()

        result = []

        for user in users:

            result.append({

                "id": str(user["_id"]),

                "fullName": user.get("fullName"),

                "email": user.get("email"),

                "role": user.get("role"),

                "avatar": user.get("avatar_url"),

                "status": user.get("status", "active"),

                "created_at": user.get("created_at")
            })

        return result

    # =====================================
    # USER DETAIL
    # =====================================
    async def get_user_detail(
        self,
        user_id
    ):

        user = admin_repository.get_user_by_id(
            user_id
        )

        if not user:
            raise HTTPException(
                404,
                "User not found"
            )

        role = user.get("role")

        result = {

            "id": str(user["_id"]),

            "fullName": user.get("fullName"),

            "email": user.get("email"),

            "role": role,

            "avatar": user.get("avatar_url"),

            "status": user.get(
                "status",
                "active"
            ),

            "joined_date": user.get(
                "created_at"
            ),

            "bio": user.get("bio"),

            "phone": user.get("phone"),

            "headline": user.get("headline"),

            "skills": user.get(
                "skills",
                []
            )
        }

        # =====================================
        # LEARNER DETAIL
        # =====================================

        if role == "learner":

            enrollments = list(
                db.enrollments.find({
                    "learner_id": user["_id"]
                })
            )

            course_ids = [
                e["course_id"]
                for e in enrollments
            ]

            courses = list(
                db.courses.find({
                    "_id": {
                        "$in": course_ids
                    }
                })
            )

            completed_courses = 0

            course_items = []

            for c in courses:

                course_items.append({

                    "id": str(c["_id"]),

                    "title": c.get("title"),

                    "thumbnail": c.get("image")
                })

            result.update({

                "enrolled_courses_count":
                    len(courses),

                "completed_courses_count":
                    completed_courses,

                "courses":
                    course_items
            })

        # =====================================
        # INSTRUCTOR DETAIL
        # =====================================

        elif role == "instructor":

            courses = list(
                db.courses.find({
                    "instructor_id": user["_id"]
                })
            )

            total_students = 0

            course_items = []

            for c in courses:

                students = (
                    db.enrollments
                    .count_documents({
                        "course_id": c["_id"]
                    })
                )

                total_students += students

                course_items.append({

                    "id": str(c["_id"]),

                    "title": c.get("title"),

                    "thumbnail": c.get("image"),

                    "students": students
                })

            result.update({

                "created_courses_count":
                    len(courses),

                "total_students":
                    total_students,

                "courses":
                    course_items
            })

        # =====================================
        # ADMIN DETAIL
        # =====================================

        elif role == "admin":

            result.update({

                "permissions": [
                    "all"
                ]
            })

        return result

    # =====================================
    # DELETE USER
    # =====================================

    async def delete_user(self, user_id):

        user = admin_repository.get_user_by_id(
            user_id
        )

        if not user:
            raise HTTPException(404, "User not found")

        admin_repository.delete_user(user_id)

        return {
            "message": "User deleted successfully"
        }

    # =====================================
    # GET ALL COURSES
    # =====================================

    async def get_all_courses(self):

        courses = admin_repository.get_all_courses()

        result = []

        for course in courses:

            instructor = db.users.find_one({
                "_id": course.get("instructor_id")
            })

            enrollments = db.enrollments.count_documents({
                "course_id": course["_id"]
            })

            lesson_count = db.lessons.count_documents({
                "course_id": course["_id"]
            })

            result.append({

                "id": str(course["_id"]),

                "title": course.get("title"),

                "thumbnail": course.get("image"),

                "category": course.get("category"),

                "price": course.get("price", 0),

                "status": course.get("status"),

                "duration": course.get("duration", "0m"),

                "students": enrollments,

                "lessonCount": lesson_count,

                "created_at": course.get("created_at"),

                "instructor": instructor.get("fullName")
                if instructor else "Unknown"
            })

        return result

    # =====================================
    # DASHBOARD
    # =====================================

    async def get_dashboard(self):

        return {

            "totalUsers":
                admin_repository.count_users(),

            "totalCourses":
                admin_repository.count_courses(),

            "totalEnrollments":
                admin_repository.count_enrollments()
        }


admin_service = AdminService()