from datetime import datetime
from bson import ObjectId


def instructor_profile_model(profile) -> dict:
    return {
        "id": str(profile["_id"]),
        "userId": str(profile["user_id"]),  # ✅ đổi camelCase

        "headline": profile.get("headline"),
        "bio": profile.get("bio"),

        "linkedin_url": profile.get("linkedin_url"),
        "github_url": profile.get("github_url"),
        "youtube_url": profile.get("youtube_url"),  # ✅ thêm
        "website_url": profile.get("website_url"),

        "specializations": profile.get("specializations", []),

        # ✅ convert datetime → string
        "created_at": profile.get("created_at").isoformat() if profile.get("created_at") else None,
        "updated_at": profile.get("updated_at").isoformat() if profile.get("updated_at") else None,
    }