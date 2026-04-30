from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from .instructor_schema import InstructorProfileUpdate
from app.middleware.auth_middleware import get_current_user
from app.modules.instructor.instructor_service import instructor_service

router = APIRouter(prefix="/instructor", tags=["Instructor"])


# =========================
# 🔍 GET PROFILE
# =========================
@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return instructor_service.get_instructor_profile(current_user["id"])


# =========================
# 🔄 UPDATE PROFILE (JSON)
# =========================
@router.put("/update-profile")
def update_profile(
    data: InstructorProfileUpdate,
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return instructor_service.update_instructor_profile(current_user["id"], data)


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

    return instructor_service.upload_avatar(current_user["id"], file)


# =========================
# 🔥 API GỘP (TEXT + AVATAR)
# =========================
@router.post("/update-full-profile")
def update_full_profile_api(
    fullName: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),
    gender: str = Form(None),
    dob: str = Form(None),
    address: str = Form(None),

    headline: str = Form(None),
    bio: str = Form(None),
    specializations: str = Form(None),

    linkedin: str = Form(None),
    github: str = Form(None),
    youtube: str = Form(None),
    website: str = Form(None),

    file: UploadFile = File(None),

    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    # 🔥 gom data lại
    data = {
        "fullName": fullName,
        "email": email,
        "phone": phone,
        "gender": gender,
        "dob": dob,
        "address": address,
        "headline": headline,
        "bio": bio,
        "specializations": specializations,
        "linkedin": linkedin,
        "github": github,
        "youtube": youtube,
        "website": website
    }

    # update profile
    result = instructor_service.update_instructor_profile(current_user["id"], data)

    # nếu có file thì upload avatar
    if file:
        instructor_service.upload_avatar(current_user["id"], file)

    return result


# =========================
# 📊 GET STUDENTS
# =========================
@router.get("/students")
async def get_students(
    search: str = None,
    course_id: str = None,
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "instructor":
        raise HTTPException(status_code=403, detail="Access denied")

    return await instructor_service.get_students(
        instructor_id=current_user["id"],
        search=search,
        course_id=course_id
    )