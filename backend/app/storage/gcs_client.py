from google.cloud import storage
from datetime import timedelta
import uuid

class GCSClient:
    def __init__(self):
        self.client = storage.Client.from_service_account_json(
            "C:/Users/ADMIN/Desktop/Cap2/Cap2/edusync-491910-0a7be5d8fd86.json"
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
            "file_url": f"https://storage.googleapis.com/{self.bucket_name}/{unique_filename}"
        }