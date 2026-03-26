from app.modules.user.user_repository import get_user_by_id, update_user
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
            "avatarUrl": user.get("avatarUrl"),
            "phone": user.get("phone"),
            "dob": user.get("dob"),
            "gender": user.get("gender"),
            "address": user.get("address"),
        }

    # 🔄 UPDATE PROFILE (EDIT)
    def update_profile(self, user_id: str, data: dict):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # chỉ update field hợp lệ
        allowed_fields = [
            "fullName",
            "avatarUrl",
            "phone",
            "dob",
            "gender",
            "address"
        ]

        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        update_user(user_id, update_data)


# singleton giống project bạn
user_service = UserService()