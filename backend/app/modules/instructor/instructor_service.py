from fastapi import HTTPException
from .instructor_repository import *
from .instructor_model import instructor_profile_model
from app.modules.user.user_repository import get_user_by_id, update_user
from app.utils.cloudinary import upload_image


# =========================
# 🔍 GET INSTRUCTOR PROFILE
# =========================
def get_instructor_profile(user_id: str):
    profile = get_by_user_id(user_id)
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        **instructor_profile_model(profile),

        # 🔥 BASIC INFO (user)
        "fullName": user.get("fullName", ""),
        "email": user.get("email", ""),
        "phone": str(user.get("phone", "")),  # ✅ ép string
        "gender": user.get("gender", ""),
        "dob": user.get("dob", ""),
        "address": user.get("address", ""),
        "avatarUrl": user.get("avatar_url", "") or user.get("avatarUrl", ""),  # ✅ fallback cả 2 field

        # 🔥 SOCIAL
        "linkedin": profile.get("linkedin_url", ""),
        "github": profile.get("github_url", ""),
        "youtube": profile.get("youtube_url", ""),
        "website": profile.get("website_url", ""),

        # 🔥 STATS
        "totalStudents": profile.get("totalStudents", 0),
        "totalCourses": profile.get("totalCourses", 0),
        "isVerified": profile.get("isVerified", True),
    }


# =========================
# 🔄 UPDATE INSTRUCTOR PROFILE (JSON)
# =========================
def update_instructor_profile(user_id: str, data):
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔥 clean data
    data_dict = {
        k: v for k, v in data.dict(exclude_unset=True).items()
        if v is not None
    }

    # =========================
    # 🔥 UPDATE USER
    # =========================
    user_fields_map = {
        "fullName": "fullName",
        "email": "email",
        "phone": "phone",
        "gender": "gender",
        "dob": "dob",
        "address": "address",
        "avatarUrl": "avatar_url"
    }

    user_update = {}

    for key, db_key in user_fields_map.items():
        if key in data_dict:
            user_update[db_key] = data_dict[key]

    if user_update:
        update_user(user_id, user_update)

    # =========================
    # 🔥 UPDATE INSTRUCTOR
    # =========================
    instructor_fields_map = {
        "headline": "headline",
        "bio": "bio",
        "specializations": "specializations",

        "linkedin": "linkedin_url",
        "github": "github_url",
        "youtube": "youtube_url",
        "website": "website_url",

        "totalStudents": "totalStudents",
        "totalCourses": "totalCourses",
        "isVerified": "isVerified"
    }

    instructor_update = {}

    for key, db_key in instructor_fields_map.items():
        if key in data_dict:
            instructor_update[db_key] = data_dict[key]

    update_profile(user_id, instructor_update)

    return get_instructor_profile(user_id)


# =========================
# 🖼️ UPLOAD AVATAR (RIÊNG)
# =========================
def upload_avatar(user_id: str, file):
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_url = upload_image(file.file)

    update_user(user_id, {"avatar_url": image_url})

    return {
        "message": "Upload avatar thành công",
        "avatarUrl": image_url
    }


# =========================
# 🔥 FULL UPDATE (GỘP TEXT + AVATAR)
# =========================
def update_full_profile(
    user_id,
    fullName,
    email,
    phone,
    gender,
    dob,
    address,
    headline,
    bio,
    specializations,
    linkedin,
    github,
    youtube,
    website,
    file
):
    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # =========================
    # 🔥 UPDATE USER
    # =========================
    user_update = {}

    if fullName: user_update["fullName"] = fullName
    if email: user_update["email"] = email
    if phone: user_update["phone"] = phone
    if gender: user_update["gender"] = gender
    if dob: user_update["dob"] = dob
    if address: user_update["address"] = address

    # 🔥 upload avatar nếu có
    if file:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        image_url = upload_image(file.file)
        user_update["avatar_url"] = image_url

    if user_update:
        update_user(user_id, user_update)

    # =========================
    # 🔥 UPDATE INSTRUCTOR
    # =========================
    instructor_update = {}

    if headline: instructor_update["headline"] = headline
    if bio: instructor_update["bio"] = bio

    if specializations:
        instructor_update["specializations"] = [
            s.strip() for s in specializations.split(",")
        ]

    if linkedin: instructor_update["linkedin_url"] = linkedin
    if github: instructor_update["github_url"] = github
    if youtube: instructor_update["youtube_url"] = youtube
    if website: instructor_update["website_url"] = website

    if instructor_update:
        update_profile(user_id, instructor_update)

    return get_instructor_profile(user_id)