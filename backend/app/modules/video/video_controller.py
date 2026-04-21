from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import require_role
from app.modules.video.video_service import VideoService
from app.modules.video.video_schema import VideoRequest, GenerateTranscriptRequest

router = APIRouter()
video_service = VideoService()


# ===================== UPLOAD =====================

@router.post("/instructor/videos/upload-url")
async def get_upload_url(
    filename: str,
    content_type: str = "video/mp4",
    user=Depends(require_role(["instructor"]))
):
    return await video_service.generate_upload_url(filename, content_type)


# ===================== CREATE =====================

@router.post("/instructor/videos")
async def save_video(
    data: VideoRequest,
    user=Depends(require_role(["instructor"]))
):
    return await video_service.save_video(data, user["id"])


@router.post("/instructor/videos/{video_id}/transcript")
async def generate_video_transcript(
    video_id: str,
    body: GenerateTranscriptRequest,
    user=Depends(require_role(["instructor"])),
):
    return await video_service.generate_transcript(
        video_id=video_id,
        instructor_id=user["id"],
        language=body.language or "vi",
        force=body.force,
    )