from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str



class LoginRequest(BaseModel):
    email: EmailStr
    password: str