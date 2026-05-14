import asyncio
from app.modules.ai.ai_schema import LessonContext
from app.modules.ai.gemini_service import _build_timeline_prompt

def test_timeline_prompt():
    segments = [
        {"start": 0.5, "end": 5.2, "text": "Xin chào các bạn, chào mừng đến với khóa học."},
        {"start": 5.3, "end": 10.1, "text": "Hôm nay chúng ta sẽ tìm hiểu về React Hook."},
        {"start": 65.0, "end": 70.0, "text": "Phần đầu tiên là useState, nó giúp lưu trạng thái."},
        {"start": 130.5, "end": 140.0, "text": "Tiếp theo là useEffect, dùng để gọi API."},
    ]
    ctx = LessonContext(
        title="Test Video",
        description="Test desc",
        transcript="...",
        transcript_segments=segments,
        duration="02:30"
    )

    prompt = _build_timeline_prompt(ctx, "Vietnamese")
    print("=== PROMPT ===")
    print(prompt)

if __name__ == "__main__":
    test_timeline_prompt()
