from pydantic import BaseModel, EmailStr
from typing import Optional


# 🔥 Response khi lấy profile
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: Optional[str] = None
    name: Optional[str] = None


# 🔥 Request update profile
class UpdateUserRequest(BaseModel):
    name: Optional[str] = None