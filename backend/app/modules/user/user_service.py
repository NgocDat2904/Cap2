from app.modules.user.user_repository import (
    get_user_by_id,
    update_user,
    update_user_avatar
)
from fastapi import HTTPException


class UserService:

    # 🔍 GET PROFILE
    def get_profile(self, user_id: str):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            # ✅ FIX mapping avatar
            "avatarUrl": user.get("avatar_url"),
            "phone": user.get("phone"),
            "dob": user.get("dob"),
            "gender": user.get("gender"),
            "address": user.get("address"),
        }

    # 🔄 UPDATE PROFILE
    def update_profile(self, user_id: str, data: dict):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        allowed_fields = [
            "fullName",
            "phone",
            "dob",
            "gender",
            "address"
        ]

        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        update_user(user_id, update_data)

        return {"message": "Profile updated successfully"}

    # 🖼️ ✅ UPDATE AVATAR (THÊM MỚI)
    def update_avatar(self, user_id: str, avatar_url: str):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        result = update_user_avatar(user_id, avatar_url)

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Update avatar failed")

        return {
            "avatarUrl": avatar_url
        }


# singleton
user_service = UserService()