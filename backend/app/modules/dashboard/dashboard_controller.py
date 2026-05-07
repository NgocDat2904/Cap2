from fastapi import APIRouter, Depends

from app.middleware.auth_middleware import require_role
from app.modules.dashboard.dashboard_service import dashboard_service

router = APIRouter()


@router.get("/instructor/dashboard")
async def get_dashboard(
    current_user=Depends(require_role(["instructor"]))
):
    return await dashboard_service.get_instructor_dashboard(
        current_user["id"]
    )