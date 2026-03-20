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


# 🔄 Update role (dùng cho admin)
def update_role(user_id: str, role: str):
    return db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role}}
    )


# 📝 Update thông tin user (optional - dùng sau)
def update_user(user_id: str, data: dict):
    return db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": data}
    )


# ❌ Xóa user (optional)
def delete_user(user_id: str):
    return db.users.delete_one({"_id": ObjectId(user_id)})