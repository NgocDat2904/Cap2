from fastapi import HTTPException
from .instructor_repository import *
from .instructor_model import instructor_profile_model
from app.modules.user.user_repository import get_user_by_id


# 🔍 GET INSTRUCTOR PROFILE
def get_instructor_profile(user_id: str):
    profile = get_by_user_id(user_id)

    # nếu chưa có thì tạo
    if not profile:
        profile = create_profile(user_id)

    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        **instructor_profile_model(profile),

        # 🔥 data từ user
        "fullName": user.get("fullName"),
        "avatarUrl": user.get("avatar_url"),
        "email": user.get("email")
    }


# 🔄 UPDATE INSTRUCTOR PROFILE
def update_instructor_profile(user_id: str, data):
    profile = get_by_user_id(user_id)

    if not profile:
        create_profile(user_id)

    allowed_fields = [
        "headline",
        "bio",
        "linkedin_url",
        "github_url",
        "is_first_login"
    ]

    update_data = {
        k: v for k, v in data.dict(exclude_unset=True).items()
        if k in allowed_fields
    }

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields")

    result = update_profile(user_id, update_data)

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Update failed")

    return {"message": "Profile updated successfully"}