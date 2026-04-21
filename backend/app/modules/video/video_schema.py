from pydantic import BaseModel, Field
from typing import Optional


class VideoRequest(BaseModel):
    lesson_id: str

    # ===================== VIDEO =====================

    video_url: Optional[str] = Field(
        default=None,
        description="Public URL để stream video",
    )

    storage_path: Optional[str] = Field(
        default=None,
        description="Path trong GCS bucket",
    )

    # ===================== DISPLAY =====================

    thumbnail_url: Optional[str] = None
    image: Optional[str] = Field(
        default=None,
        description="Ảnh hiển thị lesson (UI dùng)",
    )

    title: Optional[str] = None
    description: Optional[str] = None
    file_name: Optional[str] = None

    # ===================== UI METADATA =====================

    duration: Optional[str] = Field(
        default="10:00",
        description="Thời lượng video (mm:ss hoặc hh:mm:ss)",
    )

    views: Optional[int] = Field(
        default=0,
        description="Số lượt xem",
    )

    # ===================== AI CONTEXT =====================

    transcript: Optional[str] = Field(
        default=None,
        description="Transcript của video (nếu có)",
    )


class GenerateTranscriptRequest(BaseModel):
    language: Optional[str] = Field(
        default="vi",
        description="Ngôn ngữ ưu tiên cho STT, ví dụ: vi, en",
    )
    force: bool = Field(
        default=False,
        description="True = ghi đè transcript cũ nếu đã có",
    )