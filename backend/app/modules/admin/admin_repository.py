from bson import ObjectId

from app.database.mongodb import db


class AdminRepository:

    # =====================================
    # USERS
    # =====================================

    def get_all_users(self):

        return list(
            db.users.find().sort("created_at", -1)
        )

    def get_user_by_id(self, user_id):

        return db.users.find_one({
            "_id": ObjectId(user_id)
        })

    def delete_user(self, user_id):

        return db.users.delete_one({
            "_id": ObjectId(user_id)
        })

    # =====================================
    # COURSES
    # =====================================

    def get_all_courses(self):

        return list(
            db.courses.find().sort("created_at", -1)
        )

    # =====================================
    # DASHBOARD
    # =====================================

    def count_users(self):

        return db.users.count_documents({})

    def count_courses(self):

        return db.courses.count_documents({})

    def count_enrollments(self):

        return db.enrollments.count_documents({})


admin_repository = AdminRepository()