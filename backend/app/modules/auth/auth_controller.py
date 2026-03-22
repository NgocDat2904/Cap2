from fastapi import APIRouter
from app.modules.auth.auth_service import register, login
from app.modules.auth.auth_schema import RegisterRequest, LoginRequest

router = APIRouter(prefix="/auth", tags=["auth"])



@router.post("/learner/register")
def register_learner(user: RegisterRequest):
    return register(user, role="learner")


@router.post("/instructor/register")
def register_instructor(user: RegisterRequest):
    return register(user, role="instructor")



@router.post("/learner/login")
def login_learner(user: LoginRequest):
    return login(user, role="learner")



@router.post("/instructor/login")
def login_instructor(user: LoginRequest):
    return login(user, role="instructor")



@router.post("/admin/login")
def login_admin(user: LoginRequest):
    return login(user, role="admin")