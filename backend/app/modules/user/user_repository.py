from bson import ObjectId
from app.database.mongodb import db


# 🔍 Lấy user theo email
def get_user_by_email(email: str):
    return db.users.find_one({"email": email})


# 🔍 Lấy user theo id
def get_user_by_id(user_id: str):
    return db.users.find_one({"_id": ObjectId(user_id)})


# ➕ Tạo user
def create_user(user: dict):
    return db.users.insert_one(user)


# 🔄 Update role
def update_role(user_id: str, role: str):
    return db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )


# 📝 Update user
def update_user(user_id: str, data: dict):
    return db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": data}
    )


# 🖼️ ✅ Update avatar (THÊM MỚI)
def update_user_avatar(user_id: str, avatar_url: str):
    return db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"avatar_url": avatar_url}}
    )


# ❌ Delete
def delete_user(user_id: str):
    return db.users.delete_one({"_id": ObjectId(user_id)})


def get_all_users():
    return list(db.users.find({}))