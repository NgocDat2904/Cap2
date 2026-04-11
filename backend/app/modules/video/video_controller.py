from fastapi import APIRouter

from app.modules.video.video_schema import VideoRequest
from app.modules.video.video_service import VideoService


router = APIRouter()
video_service = VideoService()


# ===================== VIDEO =====================

@router.post("/videos/upload-url")
async def get_upload_url(
    filename: str,
    content_type: str = "video/mp4",
):
    return await video_service.generate_upload_url(
        filename,
        content_type,
    )


@router.post("/videos")
async def save_video(
    data: VideoRequest,
):
    return await video_service.save_video(data)