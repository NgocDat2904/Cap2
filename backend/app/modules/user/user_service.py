from app.modules.user.user_repository import (
    get_user_by_id,
    update_user,
    update_user_avatar
)
from fastapi import HTTPException
from passlib.context import CryptContext
from datetime import datetime
from app.database.mongodb import db 


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:

    # 🔍 GET PROFILE
    def get_profile(self, user_id: str):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "fullName": user.get("fullName"),
            "email": user.get("email"),
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

        updated_user = get_user_by_id(user_id)

        return {
            "message": "Profile updated successfully",
            "data": {
                "fullName": updated_user.get("fullName"),
                "email": updated_user.get("email"),
                "avatarUrl": updated_user.get("avatar_url"),
                "phone": updated_user.get("phone"),
                "dob": updated_user.get("dob"),
                "gender": updated_user.get("gender"),
                "address": updated_user.get("address"),
            }
        }

    # 🖼️ UPDATE AVATAR
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

    # 🔐 CHANGE PASSWORD
    def change_password(self, user_id: str, old_password: str, new_password: str):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not pwd_context.verify(old_password, user.get("password")):
            raise HTTPException(status_code=400, detail="Sai mật khẩu cũ")

        hashed_password = pwd_context.hash(new_password)

        update_user(user_id, {"password": hashed_password})

        return {"message": "Đổi mật khẩu thành công"}

    # =========================
    # 🔥 ADMIN - FULL USER MANAGEMENT
    # =========================
    def get_all_users(self, q=None, role=None, status=None, page=1, limit=10):
        filter_query = {}

        # 🔍 SEARCH
        if q:
            filter_query["$or"] = [
                {"fullName": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}}
            ]

        # 🎯 FILTER ROLE
        if role:
            filter_query["role"] = role

        # 🔒 FILTER STATUS
        if status == "blocked":
            filter_query["is_blocked"] = True
        elif status == "active":
            filter_query["is_blocked"] = {"$ne": True}

        # 📄 PAGINATION
        page = max(page, 1)
        limit = min(max(limit, 1), 50)
        skip = (page - 1) * limit

        cursor = db.users.find(filter_query).skip(skip).limit(limit)
        users = list(cursor)

        total_count = db.users.count_documents(filter_query)

        # 📊 STATS (global)
        all_users = list(db.users.find({}))

        total = len(all_users)
        learners = len([u for u in all_users if u.get("role") == "learner"])
        instructors = len([u for u in all_users if u.get("role") == "instructor"])
        admins = len([u for u in all_users if u.get("role") == "admin"])
        blocked = len([u for u in all_users if u.get("is_blocked")])

        result = []

        for user in users:
            created_at = user.get("created_at")

            if isinstance(created_at, datetime):
                created_at = created_at.strftime("%d/%m/%Y")
            else:
                created_at = ""

            result.append({
                "id": str(user["_id"]),
                "fullName": user.get("fullName"),
                "email": user.get("email"),
                "avatar": user.get("avatar_url"),
                "role": user.get("role"),
                "status": "blocked" if user.get("is_blocked") else "active",
                "createdAt": created_at
            })

        return {
            "stats": {
                "totalUsers": total,
                "learners": learners,
                "instructors": instructors,
                "admins": admins,
                "blocked": blocked
            },
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count
            },
            "users": result
        }

    # 🔒 BLOCK / UNBLOCK USER
    def toggle_block_user(self, user_id: str):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        new_status = not user.get("is_blocked", False)

        update_user(user_id, {"is_blocked": new_status})

        return {
            "message": "User blocked" if new_status else "User unblocked",
            "is_blocked": new_status
        }


# singleton
user_service = UserService()