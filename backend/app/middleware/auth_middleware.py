from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt import decode_access_token
from app.modules.auth.auth_repository import get_user_by_email

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    print("\n===== AUTH DEBUG START =====")
    print("TOKEN:", token)

    payload = decode_access_token(token)
    print("PAYLOAD:", payload)

    if not payload:
        print("❌ Invalid token")
        raise HTTPException(status_code=401, detail="Invalid or revoked token")

    user = get_user_by_email(payload["email"])
    print("USER FROM DB:", user)

    if not user:
        print("❌ User not found")
        raise HTTPException(status_code=401, detail="User not found")

    print("USER _id (raw):", user["_id"])
    print("USER ID (string):", str(user["_id"]))

    # FIX ObjectId + bảo mật
    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password", None)

    print("FINAL USER RETURN:", user)
    print("===== AUTH DEBUG END =====\n")

    return user


def require_role(roles: list):
    def checker(user=Depends(get_current_user)):
        print("ROLE CHECK:", user["role"], "REQUIRED:", roles)

        if user["role"] not in roles:
            print("❌ Permission denied")
            raise HTTPException(status_code=403, detail="Permission denied")

        print("✅ Role OK")
        return user

    return checker

# # đây chỉ để test
# def require_role(roles: list):
#     def wrapper():
#         return {
#             "id": "69bee21d91ffe72609b54019",
#             "role": roles[0]  # auto match role
#         }
#     return wrapper


# def require_role(roles: list):
#     def wrapper():
#         return {
#             "id": "admin123",
#             "role": "admin"   # 🔥 đổi sang admin
#         }
#     return wrapper