from fastapi import HTTPException

from app.modules.video.video_repository import VideoRepository
from app.modules.video.video_schema import VideoRequest
from app.storage.gcs_client import GCSClient


gcs_client = GCSClient()
video_repository = VideoRepository()


class VideoService:

    # ===================== UPLOAD =====================

    async def generate_upload_url(
        self,
        filename: str,
        content_type: str = "video/mp4",
    ):
        return gcs_client.generate_signed_url(
            filename,
            content_type,
        )

    # ===================== CREATE =====================

    async def save_video(self, data: VideoRequest):
        if not data.course_id:
            raise HTTPException(
                status_code=400,
                detail="course_id is required",
            )

        if not data.url and not data.storage_path:
            raise HTTPException(
                status_code=400,
                detail="Cần url hoặc storage_path để lưu video",
            )

        doc = data.model_dump(exclude_none=True)

        return video_repository.create(doc)