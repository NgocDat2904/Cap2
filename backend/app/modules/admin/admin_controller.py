from fastapi import (
    APIRouter,
    Depends
)

from app.middleware.auth_middleware import (
    require_role
)

from .admin_service import (
    admin_service
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =====================================
# DASHBOARD
# =====================================


# =====================================
# GET ALL USERS
# =====================================

@router.get("/users")
async def get_all_users(
    admin=Depends(require_role(["admin"]))
):

    return await admin_service.get_all_users()


# =====================================
# USER DETAIL
# =====================================

@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    admin=Depends(require_role(["admin"]))
):

    return await admin_service.get_user_detail(
        user_id
    )


# =====================================
# DELETE USER
# =====================================

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin=Depends(require_role(["admin"]))
):

    return await admin_service.delete_user(
        user_id
    )


# =====================================
# GET ALL COURSES