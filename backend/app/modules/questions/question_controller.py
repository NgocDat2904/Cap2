from fastapi import APIRouter, Depends

from app.middleware.auth_middleware import require_role

from app.modules.questions.question_model import (
    CreateQuestionRequest,
    CreateReplyRequest
)

from app.modules.questions.question_service import (
    question_service
)

router = APIRouter()


# =====================================
# LEARNER CREATE QUESTION
# =====================================

@router.post("/questions")
async def create_question(
    data: CreateQuestionRequest,
    user=Depends(require_role(["learner"]))
):

    return await question_service.create_question(
        data,
        user["id"]
    )


# =====================================
# GET COURSE QUESTIONS
# =====================================

@router.get("/questions/course/{course_id}")
async def get_course_questions(course_id: str):

    return await question_service.get_course_questions(
        course_id
    )


# =====================================
# CREATE REPLY
# =====================================

@router.post("/questions/{question_id}/reply")
async def create_reply(
    question_id: str,
    data: CreateReplyRequest,
    user=Depends(
        require_role([
            "learner",
            "instructor"
        ])
    )
):

    return await question_service.create_reply(
        question_id,
        data.content,
        user["id"]
    )