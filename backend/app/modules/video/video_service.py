from app.storage.gcs_client import GCSClient
from app.modules.video.video_repository import VideoRepository

gcs_client = GCSClient()
video_repository = VideoRepository()

class VideoService:

    async def generate_upload_url(self, filename: str):
        return gcs_client.generate_signed_url(filename)

    async def save_video(self, course_id: str, url: str):
        if not course_id or not url:
            raise Exception("Invalid data")

        return video_repository.create({
            "course_id": course_id,
            "url": url
        })
    