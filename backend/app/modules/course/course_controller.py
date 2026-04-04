from fastapi import APIRouter, Depends
from app.modules.course.course_service import CourseService
from app.middleware.auth_middleware import require_role

router = APIRouter()
course_service = CourseService()


@router.get("/instructor/courses")
async def get_my_courses(user=Depends(require_role(["instructor"]))):
    return await course_service.get_instructor_courses(user["id"])

@router.post("/instructor/courses")
async def create_course(
    data: dict,
    user=Depends(require_role(["instructor"]))
):
    return await course_service.create_course(data, user["id"])

@router.put("/instructor/courses/{course_id}/submit")
async def submit_course(
    course_id: str,
    user=Depends(require_role(["instructor"]))
):
    return await course_service.submit_course(course_id, user["id"])

@router.get("/admin/courses/pending")
async def get_pending_courses(
    page: int = 1,
    limit: int = 10,
    user=Depends(require_role(["admin"]))
):
    return await course_service.get_pending_courses(page, limit)


@router.put("/admin/courses/{course_id}/approve")
async def approve_course(
    course_id: str,
    price: float,
    user=Depends(require_role(["admin"]))
):
    return await course_service.approve_course(course_id, price)


@router.put("/admin/courses/{course_id}/reject")
async def reject_course(
    course_id: str,
    reason: str = "",
    user=Depends(require_role(["admin"]))
):
    return await course_service.reject_course(course_id, reason)