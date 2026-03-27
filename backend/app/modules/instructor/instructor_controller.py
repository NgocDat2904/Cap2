from fastapi import APIRouter, Depends, HTTPException
from .instructor_service import get_instructor_profile, update_instructor_profile
from .instructor_schema import InstructorProfileUpdate
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/instructor", tags=["Instructor"])


# 🔍 GET PROFILE
@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    # ✅ check role
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return get_instructor_profile(current_user["id"])


# 🔄 UPDATE PROFILE
@router.put("/profile")
def update_profile(
    data: InstructorProfileUpdate,
    current_user=Depends(get_current_user)
):
    # ✅ check role
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return update_instructor_profile(current_user["id"], data)