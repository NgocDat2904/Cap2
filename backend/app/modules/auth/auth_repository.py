from app.database.mongodb import db

collection = db["users"]


def create_user(user_data):
    result = db["users"].insert_one(user_data)
    return str(result.inserted_id)


def get_user_by_email(email: str):
     return db["users"].find_one({"email": email})