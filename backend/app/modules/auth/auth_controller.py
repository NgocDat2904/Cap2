from fastapi import APIRouter, Depends
from app.modules.auth.auth_service import register, login, update_user_role
from app.modules.auth.auth_model import RegisterRequest, LoginRequest
from app.middleware.auth_middleware import require_role

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register_user(user: RegisterRequest):
    return register(user)


@router.post("/login")
def login_user(user: LoginRequest):
    return login(user)


# Admin mới có quyền cập nhật role
@router.put("/users/{user_id}/role")
def update_role(
    user_id: str,
    role: str,
    user=Depends(require_role(["admin"]))  # 👈 chỉ admin mới dùng được
):
    return update_user_role(user_id, role)