import uuid
import os
from datetime import timedelta

from google.cloud import storage


class GCSClient:
    def __init__(self):
        key_path = os.getenv("GCS_KEY_PATH", "C:\\Users\\ADMIN\\Key\\edusync-491910-0a7be5d8fd86.json")
        self.client = None
        try:
            if os.path.exists(key_path):
                self.client = storage.Client.from_service_account_json(key_path)
                print(f"✅ GCS initialized with credentials from: {key_path}")
            else:
                print(f"⚠️ GCS key file not found at: {key_path}. Using default credentials.")
                self.client = storage.Client()
        except Exception as e:
            print(f"❌ Failed to initialize GCS client: {str(e)}")
            self.client = None
        self.bucket_name = "edusync-videos-c2se-01"

    def generate_signed_url(self, filename: str, content_type: str = "video/mp4"):
        if not self.client:
            raise RuntimeError("GCS credentials chưa sẵn sàng trên máy local")
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
        if not self.client:
            print(f"❌ GCS client not available, cannot generate read URL for: {object_name}")
            raise RuntimeError("GCS credentials chưa sẵn sàng trên máy local")
        try:
            bucket = self.client.bucket(self.bucket_name)
            blob = bucket.blob(object_name)
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=expiration_hours),
                method="GET",
            )
            print(f"✅ Generated signed read URL for: {object_name}")
            return signed_url
        except Exception as e:
            print(f"❌ Error generating signed URL for {object_name}: {str(e)}")
            raise

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