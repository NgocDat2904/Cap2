from pydantic import BaseModel
from typing import Optional


class CreateQuestionRequest(BaseModel):
    course_id: str
    lesson_id: str
    question: str


class AnswerQuestionRequest(BaseModel):
    answer: str


class QuestionResponse(BaseModel):
    id: str

    course_id: str
    lesson_id: str

    user_id: str

    question: str

    answer: Optional[str] = ""

    is_answered: bool = False

    created_at: Optional[str] = None