from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Course(BaseModel):
    title: str
    description: Optional[str] = ""
    instructor_id: str

    # thêm theo FE
    category: Optional[str] = ""
    image: Optional[str] = ""

    status: str = "DRAFT"  # DRAFT | PENDING | APPROVED | REJECTED
    price: Optional[float] = 0

    is_locked: bool = False
    reject_reason: Optional[str] = ""

    created_at: datetime = Field(default_factory=datetime.utcnow)