from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from .instructor_service import (
    get_instructor_profile,
    update_instructor_profile,
    upload_avatar,
    update_full_profile
)
from .instructor_schema import InstructorProfileUpdate
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/instructor", tags=["Instructor"])


# =========================
# 🔍 GET PROFILE
# =========================
@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return get_instructor_profile(current_user["id"])


# =========================
# 🔄 UPDATE PROFILE (JSON)
# =========================
@router.put("/profile")
def update_profile(
    data: InstructorProfileUpdate,
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return update_instructor_profile(current_user["id"], data)


# =========================
# 🖼️ UPLOAD AVATAR (RIÊNG)
# =========================
@router.post("/upload-avatar")
def upload_avatar_api(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return upload_avatar(current_user["id"], file)


# =========================
# 🔥 API GỘP (TEXT + AVATAR)
# =========================
@router.post("/update-full-profile")
def update_full_profile_api(
    # 🔥 USER
    fullName: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),
    gender: str = Form(None),
    dob: str = Form(None),
    address: str = Form(None),

    # 🔥 PROFILE
    headline: str = Form(None),
    bio: str = Form(None),
    specializations: str = Form(None),

    # 🔥 SOCIAL
    linkedin: str = Form(None),
    github: str = Form(None),
    youtube: str = Form(None),
    website: str = Form(None),

    # 🔥 FILE
    file: UploadFile = File(None),

    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return update_full_profile(
        user_id=current_user["id"],
        fullName=fullName,
        email=email,
        phone=phone,
        gender=gender,
        dob=dob,
        address=address,
        headline=headline,
        bio=bio,
        specializations=specializations,
        linkedin=linkedin,
        github=github,
        youtube=youtube,
        website=website,
        file=file
    )