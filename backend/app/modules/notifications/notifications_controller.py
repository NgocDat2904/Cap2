from fastapi import APIRouter, Depends

from app.middleware.auth_middleware import require_role
from app.modules.notifications.notification_service import (
    notification_service
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =====================================
# GET MY NOTIFICATIONS
# =====================================

@router.get("")
async def get_my_notifications(
    user=Depends(
        require_role([
            "learner",
            "instructor",
            "admin"
        ])
    )
):

    return await notification_service.get_my_notifications(
        user["id"]
    )