from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query

from app.middleware.auth_middleware import require_role
from app.modules.course.course_service import CourseService
from app.modules.course.course_model import (
    CourseDetailResponse,
    CourseResponse,
)
from app.utils.cloudinary import upload_image

router = APIRouter()
course_service = CourseService()


def _http_from_exc(e: Exception) -> HTTPException:
    msg = str(e) if str(e) else repr(e)
    return HTTPException(status_code=400, detail=msg)


# ===================== PUBLIC (LEARNER) =====================

@router.get("/courses")
async def get_all_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    try:
        return await course_service.get_public_courses(page, limit)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/courses/search")
async def search_courses(
    keyword: str = Query("", description="Search keyword"),
    category: str = Query("", description="Filter by category"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    try:
        keyword = keyword.strip()

        return await course_service.search_courses(
            keyword,
            category,
            page,
            limit,
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/courses/top")
async def get_top_courses():
    return await course_service.get_top_courses()


# 🔥 MAIN API (MATCH UI)
@router.get("/courses/detail/{course_id}", response_model=CourseDetailResponse)
async def get_course_detail(course_id: str):
    try:
        data = await course_service.get_public_course_detail(course_id)

        if not data:
            raise HTTPException(status_code=404, detail="Course not found")

        return data

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Get course detail error:", e)
        raise HTTPException(500, "Internal server error")
    

@router.get("/courses/filter")
async def filter_courses(
    category: str = Query("all"),
    price: str = Query("all"),
    page: int = Query(1),
    limit: int = Query(10),
):
    return await course_service.filter_courses(
        category,
        price,
        page,
        limit
    )


# ===================== INSTRUCTOR =====================

@router.get("/instructor/courses")
async def get_my_courses(user=Depends(require_role(["instructor"]))):
    try:
        return await course_service.get_instructor_courses(user["id"])
    except Exception as e:
        raise HTTPException(500, str(e))


@router.post("/instructor/courses")
async def create_course(
    data: dict,
    user=Depends(require_role(["instructor"])),
):
    try:
        return await course_service.create_course(data, user["id"])
    except Exception as e:
        raise _http_from_exc(e)


@router.post("/instructor/courses/thumbnail")
async def upload_course_thumbnail(
    file: UploadFile = File(...),
    _user=Depends(require_role(["instructor"])),
):
    try:
        url = upload_image(file.file)
        return {"url": url}
    except Exception as e:
        raise HTTPException(500, str(e))


@router.put("/instructor/courses/{course_id}/submit")
async def submit_course(
    course_id: str,
    user=Depends(require_role(["instructor"])),
):
    try:
        return await course_service.submit_course(course_id, user["id"])
    except Exception as e:
        raise _http_from_exc(e)


# ===================== ADMIN =====================

@router.get("/admin/courses/pending")
async def get_pending_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    user=Depends(require_role(["admin"])),
):
    try:
        return await course_service.get_pending_courses(page, limit)
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/admin/courses/{course_id}")
async def get_admin_course_detail(
    course_id: str,
    user=Depends(require_role(["admin"])),
):
    try:
        data = await course_service.get_admin_course_detail(course_id)

        if not data:
            raise HTTPException(status_code=404, detail="Course not found")

        return data

    except Exception as e:
        raise HTTPException(500, str(e))


@router.put("/admin/courses/{course_id}/approve")
async def approve_course(
    course_id: str,
    price: float,
    user=Depends(require_role(["admin"])),
):
    try:
        return await course_service.approve_course(course_id, price)
    except Exception as e:
        raise _http_from_exc(e)


@router.put("/admin/courses/{course_id}/reject")
async def reject_course(
    course_id: str,
    reason: str = "",
    user=Depends(require_role(["admin"])),
):
    try:
        return await course_service.reject_course(course_id, reason)
    except Exception as e:
        raise _http_from_exc(e)



    