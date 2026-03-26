from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.modules.auth.auth_service import register, login ,logout_user
from app.modules.auth.auth_schema import RegisterRequest, LoginRequest
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

security = HTTPBearer()


# REGISTER
@router.post("/learner/register")
def register_learner(user: RegisterRequest):
    return register(user, role="learner")


@router.post("/instructor/register")
def register_instructor(user: RegisterRequest):
    return register(user, role="instructor")


# LOGIN
@router.post("/learner/login")
def login_learner(user: LoginRequest):
    return login(user, role="learner")


@router.post("/instructor/login")
def login_instructor(user: LoginRequest):
    return login(user, role="instructor")


@router.post("/admin/login")
def login_admin(user: LoginRequest):
    return login(user, role="admin")


# LOGOUT 
@router.post("/logout")
def logout(
    user=Depends(get_current_user),   # CHECK TOKEN Ở ĐÂY
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    return logout_user(token)