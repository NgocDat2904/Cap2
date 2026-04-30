from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.modules.user.user_service import user_service
from app.middleware.auth_middleware import get_current_user
from app.utils.cloudinary import upload_image
from app.modules.user.user_schema import UserUpdate

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    return user_service.get_profile(current_user["id"])


# 🔄 UPDATE PROFILE
@router.put("/update-profile")
def update_profile(data: UserUpdate, current_user=Depends(get_current_user)):
    return user_service.update_profile(current_user["id"], data.model_dump())


# 🖼️ UPLOAD AVATAR
@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File phải là ảnh")

    url = upload_image(file.file)

    return user_service.update_avatar(current_user["id"], url)


# 🔐 CHANGE PASSWORD
@router.put("/change-password")
def change_password(
    old_password: str,
    new_password: str,
    current_user=Depends(get_current_user)
):
    return user_service.change_password(
        current_user["id"],
        old_password,
        new_password
    )

@router.get("/admin/users")
def get_all_users_api(
    q: str = None,
    role: str = None,
    status: str = None,
    page: int = 1,
    limit: int = 10,
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    return user_service.get_all_users(q, role, status, page, limit)


@router.put("/admin/users/{user_id}/toggle-block")
def toggle_block(user_id: str, current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    return user_service.toggle_block_user(user_id)