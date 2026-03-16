from app.database.mongodb import db

collection = db["users"]


def create_user(user):
    return collection.insert_one(user)


def get_user_by_email(email: str):
    return collection.find_one({"email": email})