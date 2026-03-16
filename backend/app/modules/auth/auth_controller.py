from fastapi import APIRouter
from app.modules.auth.auth_service import register, login
from app.modules.auth.auth_model import User, LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register_user(user: User):
    return register(user)


@router.post("/login")
def login_user(user: LoginRequest):
    return login(user)