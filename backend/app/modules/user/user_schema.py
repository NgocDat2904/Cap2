from pydantic import BaseModel, EmailStr
from typing import Optional


# 🔥 Response khi lấy profile

class UserProfile(BaseModel):
    fullName: str
    email: str
    avatarUrl: str | None = None
    phone: str | None = None
    dob: str | None = None
    gender: str | None = None
    address: str | None = None

# 🔥 Request update profile
class UpdateUserRequest(BaseModel):
    name: Optional[str] = None