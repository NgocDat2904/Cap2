from fastapi import HTTPException
from app.modules.auth.auth_repository import create_user, get_user_by_email
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.modules.user.user_repository import update_role as update_user_role_repo
from bson import ObjectId



def register(user):

    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = get_user_by_email(user.email)

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed = hash_password(user.password)

    # Login phân role
    if user.email.endswith("@edusync.edu.vn"):
        role = "instructor"
    else:
        role = "learner"

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed,
        "role": role
    }

    create_user(new_user)

    return {"message": "User registered successfully"}


def login(user, required_role=None):

    db_user = get_user_by_email(user.email)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if required_role and db_user.get("role") != required_role:
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

    #  validate role
    if role not in ["admin", "instructor", "learner"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    #  update DB
    result = update_user_role_repo(user_id, role)

    #  check có update thành công không
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or role unchanged")

    return {"message": "Role updated successfully"}
