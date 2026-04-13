from pydantic import BaseModel, Field
from typing import Optional


class VideoRequest(BaseModel):
    lesson_id: str

    video_url: Optional[str] = Field(
        default=None,
        description="Public URL để stream video",
    )

    storage_path: Optional[str] = Field(
        default=None,
        description="Path trong GCS bucket",
    )

    thumbnail_url: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    file_name: Optional[str] = None