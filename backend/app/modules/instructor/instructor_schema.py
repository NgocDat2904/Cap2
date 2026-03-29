from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List


class InstructorProfileUpdate(BaseModel):
    # 🔥 USER
    fullName: Optional[str] = None
    email: Optional[EmailStr] = None  # ✅ validate email
    phone: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    address: Optional[str] = None
    avatarUrl: Optional[str] = None

    # 🔥 PROFILE
    headline: Optional[str] = None
    bio: Optional[str] = None

    # 🔥 EXPERTISE
    specializations: Optional[List[str]] = None  # ✅ list thay vì string

    # 🔥 SOCIAL
    linkedin: Optional[str] = None
    github: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None

    # 🔥 STATS
    totalStudents: Optional[int] = None
    totalCourses: Optional[int] = None
    isVerified: Optional[bool] = None

    # ✅ VALIDATE PHONE
    @validator("phone")
    def validate_phone(cls, v):
        if v and not v.isdigit():
            raise ValueError("Phone must contain only numbers")
        return v