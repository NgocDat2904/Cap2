from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from app.middleware.auth_middleware import require_role
from app.modules.notifications.notification_service import (
    notification_service
)
from app.modules.notifications.notification_repository import (
    notification_repository
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


# =====================================
# MARK NOTIFICATION AS READ
# =====================================

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user=Depends(
        require_role([
            "learner",
            "instructor",
            "admin"
        ])
    )
):
    """
    Đánh dấu một thông báo đã đọc
    """
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(400, "Invalid notification ID")

    notification_repository.mark_as_read(ObjectId(notification_id))

    return {
        "status": "success",
        "message": "Notification marked as read"
    }