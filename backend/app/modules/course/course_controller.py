from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Query
from app.middleware.auth_middleware import require_role
from app.modules.course.course_model import (
    CourseResponse,
    CourseUpdate,
    CourseDetailResponse,  
    EnrollRequest,
)
from app.utils.cloudinary import upload_image
from app.middleware.auth_middleware import get_current_user
from app.modules.course.course_service import course_service
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import db
from fastapi import BackgroundTasks

router = APIRouter(prefix="", tags=["Course"])


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
    keyword: str = Query(None),
    category: str = Query(None),
    price: str = Query(None),          # under_1m | 1m_3m | over_3m
    min_price: float = Query(None),
    max_price: float = Query(None),
    sort: str = Query("newest"),       # newest | price_asc | price_desc
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    try:
        keyword = (keyword or "").strip()

        return await course_service.search_courses(
            keyword=keyword,
            category=category,
            price=price,
            min_price=min_price,
            max_price=max_price,
            sort=sort,
            page=page,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(500, str(e))


@router.get("/courses/top")
async def get_top_courses():
    try:
        return await course_service.get_top_courses()
    except Exception as e:
        raise HTTPException(500, str(e))



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


# ===================== INSTRUCTOR =====================

@router.get("/instructor/courses")
async def get_my_courses(user=Depends(require_role(["instructor"]))):
    try:
        return await course_service.get_instructor_courses(user["id"])
    except Exception as e:
        print("🔥 ERROR:", str(e))   # 👈 thêm dòng này
        raise HTTPException(500, str(e))

    
@router.post("/instructor/courses")
async def create_course(
    data: dict,
    user=Depends(require_role(["instructor"])),
):
    try:
        print("DATA RECEIVED:", data)  # 👈 thêm dòng này

        return await course_service.create_course(data, user["id"])

    except Exception as e:
        print("CREATE ERROR:", str(e))  # 👈 thêm dòng này
        raise HTTPException(400, str(e))


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


@router.post("/instructor/courses/{course_id}/submit")
async def submit_course(
    course_id: str,
    background_tasks: BackgroundTasks,
    user=Depends(require_role(["instructor"])),
):
    try:

        # Submit course
        result = await course_service.submit_course(
            course_id,
            user["id"]
        )

        # 🚀 AI chạy background
        background_tasks.add_task(
            course_service.generate_ai_for_course,
            course_id
        )

        return {
            "message": "Course submitted successfully",
            "course": result,
            "ai_processing": True
        }

    except Exception as e:
        raise _http_from_exc(e)
    

@router.get("/instructor/courses/{course_id}")
async def get_instructor_course_detail(
    course_id: str,
    user=Depends(require_role(["instructor"]))
):
    try:
        return await course_service.get_instructor_course_detail(
            course_id,
            user["id"]
        )
    except Exception as e:
        raise HTTPException(500, str(e))
    
@router.put("/instructor/courses/{course_id}")
async def update_course(
    course_id: str,
    data: CourseUpdate,  # ✅ Thay đổi: Dùng Pydantic model thay vì dict
    user=Depends(require_role(["instructor"]))
):
    try:
        return await course_service.update_course(
            course_id,
            user["id"],
            data.dict()  # Convert model thành dict để truyền vào service
        )
    except Exception as e:
        raise HTTPException(400, str(e))
    

@router.delete("/instructor/courses/{course_id}")
async def delete_course(
    course_id: str,
    user=Depends(require_role(["instructor"]))
):
    try:
        return await course_service.delete_course(
            course_id,
            user["id"]
        )
    except Exception as e:
        raise HTTPException(400, str(e))
    



# ===================== Learner =====================
@router.post("/courses/enroll")
async def enroll_course(
    data: EnrollRequest,
    user=Depends(require_role(["learner", "instructor"]))
):
    return await course_service.enroll(data.course_id, user["id"])

@router.get("/courses/{course_id}/students")
async def get_course_students(
    course_id: str,
    user=Depends(require_role(["instructor", "admin"]))
):
    return await course_service.get_course_students(course_id)


@router.delete("/courses/enroll")
async def unenroll_course(
    data: EnrollRequest,
    user=Depends(require_role(["learner"]))
):
    return await course_service.unenroll(data.course_id, user["id"])


@router.get("/me/courses")
async def get_my_learning_courses(
    user=Depends(require_role(["learner"]))
):
    return await course_service.get_my_courses(user["id"])


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
    
@router.get("/admin/courses")
async def get_admin_courses(
    q: str = None,
    category: str = None,
    status: str = None,
    page: int = 1,
    limit: int = 10,
    current_user=Depends(get_current_user)
):
    # 🔒 CHỈ ADMIN
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    return await course_service.get_admin_courses(
        q=q,
        category=category,
        status=status,
        page=page,
        limit=limit
    )



@router.put("/admin/courses/{course_id}/moderate")
async def moderate_course(
    course_id: str,
    status: str,
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    return await course_service.moderate_course(course_id, status)



@router.put("/admin/courses/{course_id}/resolve-update")
async def resolve_pending_update(
    course_id: str,
    price: float | None = None,   # Optional — Admin điều chỉnh giá, để trống = giữ nguyên
    user=Depends(require_role(["admin"])),
):
    """
    Admin xác nhận đã review bản cập nhật của khóa học đang PUBLISHED.
    - Approve tất cả bài giảng đang chờ duyệt (is_approved=False → True)
    - Tắt cờ has_pending_update
    - Cập nhật giá bán nếu được truyền vào
    """
    try:
        return await course_service.resolve_pending_update(course_id, price)
    except Exception as e:
        raise _http_from_exc(e)
    





    