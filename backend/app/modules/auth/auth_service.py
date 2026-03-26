from app.modules.auth.auth_repository import create_user, get_user_by_email
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.modules.user.user_repository import update_role as update_user_role_repo
from fastapi import HTTPException
from app.utils.jwt import revoke_token


def register(user, role=None):

    # check password match
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # check email tồn tại
    existing = get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    #  FIX: ép kiểu + trim
    password = str(user.password).strip()

    hashed = hash_password(password)

    # fallback role
    if not role:
        role = "instructor" if user.email.endswith("@edusync.edu.vn") else "learner"

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "role": role
    }

    result = create_user(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


def login(user, role=None):

    db_user = get_user_by_email(user.email)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    #  FIX: ép kiểu
    password = str(user.password).strip()

    if not verify_password(password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # check role
    if role and db_user["role"] != role:
        raise HTTPException(status_code=403, detail="Unauthorized role")

    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "email": db_user["email"],
        "role": db_user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


def update_user_role(user_id, role):

    if role not in ["admin", "instructor", "learner"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    #  KHÔNG convert ObjectId ở đây
    result = update_user_role_repo(user_id, role)

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or role unchanged")

    return {"message": "Role updated successfully"}


def logout_user(token: str):
    try:
        revoke_token(token)
        return {
            "message": "Logout successful"
        }
    except:
        raise HTTPException(status_code=401, detail="Invalid token")