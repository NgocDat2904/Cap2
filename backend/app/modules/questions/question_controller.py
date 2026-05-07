from fastapi import APIRouter, Depends

from app.middleware.auth_middleware import require_role

from app.modules.questions.question_model import (
    CreateQuestionRequest,
    AnswerQuestionRequest
)

from app.modules.questions.question_service import question_service


router = APIRouter()


# =========================
# LEARNER ASK
# =========================
@router.post("/questions")
async def create_question(
    data: CreateQuestionRequest,
    user=Depends(require_role(["learner"]))
):
    return await question_service.create_question(
        data,
        user["id"]
    )


# =========================
# GET COURSE QUESTIONS
# =========================
@router.get("/questions/course/{course_id}")
async def get_course_questions(course_id: str):
    return await question_service.get_course_questions(course_id)


# =========================
# INSTRUCTOR ANSWER
# =========================
@router.put("/questions/{question_id}/answer")
async def answer_question(
    question_id: str,
    data: AnswerQuestionRequest,
    user=Depends(require_role(["instructor"]))
):
    return await question_service.answer_question(
        question_id,
        data.answer
    )