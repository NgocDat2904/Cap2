from typing import List

from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from app.modules.auth.auth_repository import get_user_by_email
from app.utils.jwt import decode_access_token


security = HTTPBearer()


# ===================== AUTH =====================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    # 🔥 FIX crash nếu thiếu email
    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload",
        )

    user = get_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    # 🔥 sanitize user (an toàn)
    return {
        "id": str(user["_id"]),
        "email": user.get("email"),
        "role": user.get("role"),
    }


# ===================== ROLE =====================

def require_role(roles: List[str]):
    def checker(user=Depends(get_current_user)):

        user_role = user.get("role")

        if user_role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Permission denied",
            )

        return user

    return checker


# ===================== TEST MOCK (OPTIONAL) =====================

# def require_role(roles: List[str]):
#     def wrapper():
#         return {
#             "id": "test_user",
#             "role": roles[0],
#         }
#     return wrapper