from datetime import datetime
from typing import Optional
from enum import Enum

from pydantic import BaseModel, Field


# ===================== ENUM =====================

class CourseStatus(str, Enum):
    DRAFT = "DRAFT"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# ===================== BASE =====================

class CourseBase(BaseModel):
    title: str = Field(..., min_length=5)
    description: Optional[str] = None

    category: Optional[str] = None
    image: Optional[str] = None


# ===================== CREATE =====================

class CourseCreate(CourseBase):
    pass


# ===================== DB MODEL =====================

class CourseInDB(CourseBase):
    instructor_id: str

    status: CourseStatus = CourseStatus.DRAFT
    price: float = 0

    is_locked: bool = False
    reject_reason: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ===================== RESPONSE =====================

class CourseResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None

    category: Optional[str] = None
    image: Optional[str] = None

    price: float = 0
    status: CourseStatus