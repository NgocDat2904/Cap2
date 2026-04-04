from fastapi import APIRouter
from app.modules.video.video_service import VideoService
from pydantic import BaseModel

router = APIRouter()
video_service = VideoService()

class VideoRequest(BaseModel):
    course_id: str
    url: str

@router.post("/videos/upload-url")
async def get_upload_url(filename: str):
    return await video_service.generate_upload_url(filename)


@router.post("/videos")
async def save_video(data: VideoRequest):
    return await video_service.save_video(data.course_id, data.url)