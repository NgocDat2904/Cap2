from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.middleware.auth_middleware import (
    require_role
)

from app.database.mongodb import db

from .learning_service import (
    LearningService
)

router = APIRouter(
    prefix="/learning",
    tags=["Learning"]
)

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

        return await service.enroll(
            data["course_id"],
            user["id"]
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ======================
# MY COURSES
# ======================
@router.get("/my-courses")
async def get_my_courses(
    user=Depends(require_role(["learner"]))
):
    try:

        return await service.get_my_courses(
            user["id"]
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ======================
# COMPLETE LESSON
# ======================
@router.post(
    "/courses/{course_id}/lessons/{lesson_id}/complete"
)
async def complete_lesson(

    course_id: str,

    lesson_id: str,

    user=Depends(require_role(["learner"]))
):
    try:

        return await service.complete_lesson(

            course_id,

            lesson_id,

            user["id"]
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ======================
# UPDATE PROGRESS
# ======================
@router.post("/progress")
async def update_progress(
    data: dict,
    user=Depends(require_role(["learner"]))
):
    """
    Body:
    {
        "course_id": "...",

        "lesson_id": "...",

        "video_id": "...",

        "progress_seconds": 45,

        "duration": 120
    }
    """

    try:

        return await service.update_progress(

            data["course_id"],

            data["lesson_id"],

            data["video_id"],

            user["id"],

            data["progress_seconds"],

            data["duration"]
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ======================
# GET PROGRESS
# ======================
@router.get("/progress/{lesson_id}")
async def get_progress(

    lesson_id: str,

    user=Depends(require_role(["learner"]))
):
    try:

        progress = db.lesson_progress.find_one({

            "lesson_id": ObjectId(lesson_id),

            "user_id": ObjectId(
                user["id"]
            )
        })

        # ======================
        # NOT FOUND
        # ======================

        if not progress:

            return {

                "progress_seconds": 0,

                "duration": 0,

                "progress_percent": 0,

                "is_completed": False
            }

        # ======================
        # GET DATA
        # ======================

        seconds = progress.get(
            "progress_seconds",
            0
        )

        duration = progress.get(
            "duration_seconds",
            0
        )

        percent = progress.get(
            "progress_percent",
            0
        )

        return {

            "progress_seconds": seconds,

            "duration": duration,

            "progress_percent": percent,

            "is_completed": progress.get(
                "is_completed",
                False
            )
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )