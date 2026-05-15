from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import require_role
from app.modules.course_content.content_service import ContentService

router = APIRouter(prefix="/instructor", tags=["Course Content"])
service = ContentService()



@router.post("/lessons")
async def create_lesson(
    data: dict,
    user=Depends(require_role(["instructor"]))
):
    return await service.create_lesson(data, user["id"])


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    user=Depends(require_role(["instructor", "admin"]))
):
    """
    Xóa lesson (cho cả instructor và admin)
    """
    return await service.delete_lesson(lesson_id, user["id"], user["role"])
