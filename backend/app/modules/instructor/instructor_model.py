from datetime import datetime

def instructor_profile_model(profile) -> dict:
    return {
        "id": str(profile["_id"]),
        "userId": str(profile["user_id"]),

        # BASIC
        "fullName": profile.get("fullName", ""),
        "email": profile.get("email", ""),
        "phone": profile.get("phone", ""),
        "gender": profile.get("gender", ""),
        "dob": profile.get("dob", ""),
        "address": profile.get("address", ""),
        "avatarUrl": profile.get("avatarUrl", ""),

        # PROFILE
        "headline": profile.get("headline", ""),
        "bio": profile.get("bio", ""),

        "specializations": profile.get("specializations", ""),

        # SOCIAL
        "linkedin": profile.get("linkedin_url", ""),
        "github": profile.get("github_url", ""),
        "youtube": profile.get("youtube_url", ""),
        "website": profile.get("website_url", ""),

        # STATS
        "totalStudents": profile.get("totalStudents", 0),
        "totalCourses": profile.get("totalCourses", 0),
        "isVerified": profile.get("isVerified", True),

        # TIME
        "created_at": profile.get("created_at").isoformat() if profile.get("created_at") else None,
        "updated_at": profile.get("updated_at").isoformat() if profile.get("updated_at") else None,
    }