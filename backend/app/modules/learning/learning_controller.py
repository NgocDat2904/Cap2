from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.middleware.auth_middleware import require_role
from app.database.mongodb import db
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
# COMPLETE LESSON (OPTIONAL)
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


# ======================
# 🔥 UPDATE PROGRESS (QUAN TRỌNG)
# ======================
@router.post("/progress")
async def update_progress(
    data: dict,
    user=Depends(require_role(["learner"]))
):
    """
    Body:
    {
        "lesson_id": "...",
        "progress_seconds": 45,
        "duration": 120
    }
    """
    try:
        return await service.update_progress(
            data["lesson_id"],
            user["id"],
            data["progress_seconds"],
            data["duration"]
        )
    except Exception as e:
        raise HTTPException(500, str(e))


# ======================
# 🔥 GET PROGRESS (RESUME VIDEO)
# ======================
@router.get("/progress/{lesson_id}")
async def get_progress(
    lesson_id: str,
    user=Depends(require_role(["learner"]))
):
    try:
        progress = db.lesson_progress.find_one({
            "lesson_id": ObjectId(lesson_id),
            "learner_id": ObjectId(user["id"])
        })

        if not progress:
            return {
                "progress_seconds": 0,
                "is_completed": False
            }

        return {
            "progress_seconds": progress.get("progress_seconds", 0),
            "is_completed": progress.get("is_completed", False)
        }

    except Exception as e:
        raise HTTPException(500, str(e))