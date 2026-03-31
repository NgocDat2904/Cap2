from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

collection = db["instructor_profiles"]


# 🔍 GET PROFILE (auto create nếu chưa có)
def get_by_user_id(user_id: str):
    profile = collection.find_one({"user_id": ObjectId(user_id)})

    if not profile:
        return create_profile(user_id)

    return profile


# ➕ CREATE PROFILE (đầy đủ field cho frontend)
def create_profile(user_id: str):
    profile = {
        "user_id": ObjectId(user_id),

        # 🔥 BASIC INFO
        "fullName": "",
        "email": "",
        "phone": "",
        "gender": "",
        "dob": "",
        "address": "",
        "avatarUrl": "",

        # 🔥 PROFILE INFO
        "headline": "",
        "bio": "",

        # 🔥 SOCIAL LINKS
        "linkedin_url": "",
        "github_url": "",
        "youtube_url": "",
        "website_url": "",

        # 🔥 EXPERTISE
        "specializations": [],  # giữ list

        # 🔥 STATS
        "totalStudents": 0,
        "totalCourses": 0,
        "isVerified": True,

        # 🔥 SYSTEM
        "is_first_login": True,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = collection.insert_one(profile)
    return collection.find_one({"_id": result.inserted_id})


# 🔄 UPDATE PROFILE (update toàn bộ field + auto create nếu chưa có)
def update_profile(user_id: str, data: dict):
    data["updated_at"] = datetime.utcnow()

    collection.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": data},
        upsert=True  # 🔥 chưa có thì tự tạo
    )

    return collection.find_one({"user_id": ObjectId(user_id)})