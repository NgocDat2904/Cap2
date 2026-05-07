import uuid
import os
from datetime import timedelta

from google.cloud import storage


class GCSClient:

    def __init__(self):

        key_path = os.getenv(
            "GCS_KEY_PATH",
            "C:\\Users\\ADMIN\\Key\\edusync-491910-856293ef86ce.json"
        )

        self.client = None

        try:

            if os.path.exists(key_path):

                self.client = storage.Client.from_service_account_json(
                    key_path
                )

                print(
                    f"✅ GCS initialized with credentials from: {key_path}"
                )

            else:

                print(
                    f"⚠️ GCS key file not found at: {key_path}"
                )

                self.client = storage.Client()

        except Exception as e:

            print(
                f"❌ Failed to initialize GCS client: {str(e)}"
            )

            self.client = None

        self.bucket_name = "edusync-videos-c2se-01"

    # =========================================================
    # GENERATE UPLOAD URL
    # =========================================================

    def generate_signed_url(
        self,
        filename: str,
        content_type: str = "video/mp4"
    ):

        if not self.client:
            raise RuntimeError(
                "GCS credentials chưa sẵn sàng"
            )

        bucket = self.client.bucket(
            self.bucket_name
        )

        # 🚀 FIX filename
        # KHÔNG lưu filename gốc
        # tránh lỗi khoảng trắng/unicode

        ext = os.path.splitext(filename)[1]

        if not ext:
            ext = ".mp4"

        unique_filename = (
            f"videos/{uuid.uuid4()}{ext}"
        )

        blob = bucket.blob(
            unique_filename
        )

        upload_url = blob.generate_signed_url(
            version="v4",

            expiration=timedelta(
                minutes=15
            ),

            method="PUT",

            content_type=content_type,
        )

        public_url = (
            f"https://storage.googleapis.com/"
            f"{self.bucket_name}/"
            f"{unique_filename}"
        )

        print("✅ Upload signed URL generated")

        return {

            "upload_url": upload_url,

            "file_url": public_url,

            "storage_path": unique_filename,
        }

    # =========================================================
    # GENERATE READ URL
    # =========================================================

    def generate_read_signed_url(
        self,
        object_name: str,
        expiration_minutes: int = 60,
    ) -> str:

        if not self.client:

            raise RuntimeError(
                "GCS credentials chưa sẵn sàng"
            )

        try:

            bucket = self.client.bucket(
                self.bucket_name
            )

            blob = bucket.blob(
                object_name
            )

            signed_url = blob.generate_signed_url(

                version="v4",

                expiration=timedelta(
                    minutes=expiration_minutes
                ),

                method="GET",
            )

            print(
                f"✅ Generated read signed URL for: {object_name}"
            )

            return signed_url

        except Exception as e:

            print(
                f"❌ Error generating signed URL: {str(e)}"
            )

            raise

    # =========================================================
    # GET OBJECT NAME FROM PUBLIC URL
    # =========================================================

    def object_name_from_public_url(
        self,
        url: str
    ) -> str | None:

        if not url:
            return None

        prefix = (
            f"https://storage.googleapis.com/"
            f"{self.bucket_name}/"
        )

        if url.startswith(prefix):

            return url[len(prefix):].split("?")[0]

        alt = (
            f"https://{self.bucket_name}.storage.googleapis.com/"
        )

        if url.startswith(alt):

            return url[len(alt):].split("?")[0]

        return None