from app.modules.auth.auth_repository import create_user, get_user_by_email
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token


def register(user):

    existing = get_user_by_email(user.email)

    if existing:
        raise Exception("Email already exists")

    hashed = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed
    }

    create_user(new_user)

    return {"message": "User registered successfully"}


def login(user):

    db_user = get_user_by_email(user.email)

    if not db_user:
        raise Exception("Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise Exception("Invalid credentials")

    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "email": db_user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }
