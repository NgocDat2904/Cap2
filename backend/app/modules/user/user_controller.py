from fastapi import APIRouter, Depends, UploadFile, File
from app.modules.user.user_service import user_service
from app.middleware.auth_middleware import get_current_user
from app.utils.cloudinary import upload_image

router = APIRouter(prefix="/user", tags=["User"])


# 🔍 GET PROFILE
@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    return user_service.get_profile(current_user["id"])


# 🔄 UPDATE PROFILE
@router.put("/profile")
def update_profile(data: dict, current_user=Depends(get_current_user)):
    return user_service.update_profile(current_user["id"], data)


# 🖼️ UPLOAD AVATAR
@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    url = upload_image(file.file)

    # ✅ gọi service (đúng kiến trúc)
    return user_service.update_avatar(current_user["id"], url)