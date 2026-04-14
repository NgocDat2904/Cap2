from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import require_role
from app.modules.course_content.content_service import ContentService

router = APIRouter(prefix="/instructor", tags=["Course Content"])
service = ContentService()


@router.post("/sections")
async def create_section(
    data: dict,
    user=Depends(require_role(["instructor"]))
):
    return await service.create_section(data, user["id"])


@router.post("/lessons")
async def create_lesson(
    data: dict,
    user=Depends(require_role(["instructor"]))
):
    return await service.create_lesson(data, user["id"])

