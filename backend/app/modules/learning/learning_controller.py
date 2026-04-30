from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth_middleware import require_role
from .learning_service import LearningService

router = APIRouter(prefix="/learning", tags=["Learning"])

service = LearningService()


# ======================
# ENROLL
# ======================
@router.post("/enroll")
async def enroll_course(
    data: dict,
    user=Depends(require_role(["learner"]))
):
    try:
        return await service.enroll(data["course_id"], user["id"])
    except Exception as e:
        raise HTTPException(500, str(e))


# ======================
# MY COURSES
# ======================
@router.get("/my-courses")
async def get_my_courses(
    user=Depends(require_role(["learner"]))
):
    try:
        return await service.get_my_courses(user["id"])
    except Exception as e:
        raise HTTPException(500, str(e))


# ======================
# COMPLETE LESSON
# ======================
@router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: str,
    user=Depends(require_role(["learner"]))
):
    try:
        return await service.complete_lesson(lesson_id, user["id"])
    except Exception as e:
        raise HTTPException(500, str(e))