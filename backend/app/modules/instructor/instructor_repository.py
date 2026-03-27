from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

collection = db["instructor_profiles"]


def get_by_user_id(user_id: str):
    return collection.find_one({"user_id": ObjectId(user_id)})


def create_profile(user_id: str):
    profile = {
        "user_id": ObjectId(user_id),

        "headline": "",
        "bio": "",

        "linkedin_url": "",
        "github_url": "",
        "youtube_url": "",
        "website_url": "",

        "specializations": [],

        "is_first_login": True,

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = collection.insert_one(profile)
    return collection.find_one({"_id": result.inserted_id})


def update_profile(user_id: str, data: dict):
    data["updated_at"] = datetime.utcnow()

    result = collection.update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": data}
    )
    return result