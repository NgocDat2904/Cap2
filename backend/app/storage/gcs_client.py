import uuid
from datetime import timedelta

from google.cloud import storage


class GCSClient:
    def __init__(self):
        self.client = storage.Client.from_service_account_json(
            "C:/Users/ADMIN/Key/edusync-491910-0a7be5d8fd86.json"
        )
        self.bucket_name = "edusync-videos-c2se-01"

    def generate_signed_url(self, filename: str, content_type: str = "video/mp4"):
        bucket = self.client.bucket(self.bucket_name)

        unique_filename = f"videos/{uuid.uuid4()}_{filename}"
        blob = bucket.blob(unique_filename)

        url = blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=15),
            method="PUT",
            content_type=content_type,
        )

        return {
            "upload_url": url,
            "file_url": f"https://storage.googleapis.com/{self.bucket_name}/{unique_filename}",
            "storage_path": unique_filename,
        }

    def generate_read_signed_url(
        self, object_name: str, expiration_hours: int = 168
    ) -> str:
        bucket = self.client.bucket(self.bucket_name)
        blob = bucket.blob(object_name)
        return blob.generate_signed_url(
            version="v4",
            expiration=timedelta(hours=expiration_hours),
            method="GET",
        )

    def object_name_from_public_url(self, url: str) -> str | None:
        """Lấy object path từ URL công khai GCS (bucket mặc định của client)."""
        if not url:
            return None
        prefix = f"https://storage.googleapis.com/{self.bucket_name}/"
        if url.startswith(prefix):
            return url[len(prefix) :].split("?")[0]
        alt = f"https://{self.bucket_name}.storage.googleapis.com/"
        if url.startswith(alt):
            return url[len(alt) :].split("?")[0]
        return None