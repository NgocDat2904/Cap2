from pydantic import BaseModel
from typing import Optional


# =========================
# CREATE QUESTION
# =========================

class CreateQuestionRequest(BaseModel):

    course_id: str

    lesson_id: str

    content: str


# =========================
# CREATE REPLY
# =========================

class CreateReplyRequest(BaseModel):

    content: str


# =========================
# RESPONSE
# =========================

class QuestionResponse(BaseModel):

    id: str

    course_id: str

    lesson_id: str

    user_id: str

    content: str

    type: str

    parent_id: Optional[str] = None

    created_at: Optional[str] = None