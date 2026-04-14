from datetime import datetime
from typing import Optional, List
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


# ===================== RESPONSE (LIST) =====================

class CourseResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None

    category: Optional[str] = None
    image: Optional[str] = None

    price: float = 0
    status: CourseStatus


# ===================== INSTRUCTOR =====================

class InstructorInfo(BaseModel):
    id: str
    name: Optional[str] = None
    title: Optional[str] = None
    avatar: Optional[str] = None


# ===================== LESSON =====================

class LessonResponse(BaseModel):
    id: str
    title: str

    duration: Optional[str] = None
    views: Optional[int] = 0
    image: Optional[str] = None

    play_url: Optional[str] = None


# ===================== SECTION =====================

class SectionResponse(BaseModel):
    id: str
    title: str
    lessons: List[LessonResponse] = []


# ===================== COURSE DETAIL =====================

class CourseDetailResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None

    category: Optional[str] = None
    price: float = 0

    thumbnail: Optional[str] = None

    instructor: Optional[InstructorInfo] = None

    students: int = 0
    duration: Optional[str] = None
    lessonCount: int = 0

    sections: List[SectionResponse] = []