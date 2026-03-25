from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt import decode_access_token
from app.modules.auth.auth_repository import get_user_by_email

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user_by_email(payload["email"])

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # 🔥 FIX ObjectId + bảo mật
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password", None)

    return user


def require_role(roles: list):
    def checker(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return checker