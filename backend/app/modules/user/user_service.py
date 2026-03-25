from app.modules.user.user_repository import get_user_by_id, update_user
from fastapi import HTTPException


class UserService:

    def get_profile(self, user_id: str):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 🔥 FIX ObjectId + bảo mật
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password", None)

        return user

    def update_profile(self, user_id: str, data: dict):
        result = update_user(user_id, data)

        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Update failed")

        return True


user_service = UserService()