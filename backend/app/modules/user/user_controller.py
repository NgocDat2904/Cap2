from fastapi import APIRouter, Depends
from app.modules.user.user_service import user_service
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/updateprofile")
def get_profile(current_user=Depends(get_current_user)):
    return user_service.get_profile(current_user["id"])


@router.put("/updateprofile")
def update_profile(data: dict, current_user=Depends(get_current_user)):
    user_service.update_profile(current_user["id"], data)
    return {"message": "Update successful"}