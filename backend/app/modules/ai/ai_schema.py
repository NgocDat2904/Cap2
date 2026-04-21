from pydantic import BaseModel, Field
from typing import Optional, List


class LessonContext(BaseModel):
    """Nội dung nền để AI chỉ trả lời theo video/bài học."""

    title: str = Field(..., description="Tiêu đề bài / video")
    description: Optional[str] = Field(
        default=None,
        description="Mô tả ngắn (nếu có)",
    )
    transcript: Optional[str] = Field(
        default=None,
        description="Transcript hoặc nội dung chi tiết (ưu tiên cho độ chính xác)",
    )


class ChatMessage(BaseModel):
    is_ai: bool = Field(..., description="True = tin từ AI, False = từ học viên")
    text: str


class ChatRequest(BaseModel):
    context: LessonContext
    messages: List[ChatMessage] = Field(
        ...,
        min_length=1,
        description="Lịch sử chat; tin cuối là câu hỏi hiện tại của học viên",
    )


class SummaryRequest(BaseModel):
    context: LessonContext
    language: str = Field(default="vi", description="Ngôn ngữ tóm tắt, mặc định tiếng Việt")


class QuizRequest(BaseModel):
    context: LessonContext
    num_questions: int = Field(default=5, ge=1, le=15)
    language: str = Field(default="vi")


class VideoChatRequest(BaseModel):
    video_id: str
    messages: List[ChatMessage] = Field(..., min_length=1)


class VideoSummaryRequest(BaseModel):
    video_id: str
    language: str = Field(default="vi")


class VideoQuizRequest(BaseModel):
    video_id: str
    num_questions: int = Field(default=5, ge=1, le=15)
    language: str = Field(default="vi")


class MindmapRequest(BaseModel):
    context: LessonContext
    language: str = Field(default="vi")


class VideoMindmapRequest(BaseModel):
    video_id: str
    language: str = Field(default="vi")
