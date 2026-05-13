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
    user=Depends(require_role(["learner", "instructor"]))
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
# GET LESSON QUESTIONS
# =====================================

@router.get("/questions/lesson/{lesson_id}")
async def get_lesson_questions(lesson_id: str):

    return await question_service.get_lesson_questions(
        lesson_id
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


# =====================================
# DELETE QUESTION
# =====================================

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    user=Depends(
        require_role([
            "learner",
            "instructor"
        ])
    )
):
    """
    Xóa câu hỏi (question).
    - Learner: Chỉ xóa được question của chính mình
    - Instructor: Xóa được tất cả question trong khóa học của mình
    """
    return await question_service.delete_question(
        question_id,
        user["id"],
        user["role"]
    )


# =====================================
# DELETE REPLY
# =====================================

@router.delete("/questions/{question_id}/reply/{reply_id}")
async def delete_reply(
    question_id: str,
    reply_id: str,
    user=Depends(
        require_role([
            "learner",
            "instructor"
        ])
    )
):
    """
    Xóa reply (câu trả lời).
    - Learner: Chỉ xóa được reply của chính mình
    - Instructor: Xóa được tất cả reply trong khóa học của mình
    """
    return await question_service.delete_reply(
        reply_id,
        user["id"],
        user["role"]
    )