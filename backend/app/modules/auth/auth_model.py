from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str
    role: Optional[str] = "learner"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str