from pydantic import BaseModel, Field


class VideoRequest(BaseModel):
    course_id: str

    url: str = Field(
        default="",
        description=(
            "URL tham chiếu (thường không phát được nếu bucket private — "
            "dùng storage_path)"
        ),
    )

    storage_path: str | None = Field(
        default=None,
        description="Đường dẫn object trong bucket (từ API presign: storage_path)",
    )

    thumbnail_url: str | None = Field(
        default=None,
        description="Ảnh đại diện (Cloudinary), chung với khóa học",
    )

    title: str | None = None
    description: str | None = None
    file_name: str | None = None