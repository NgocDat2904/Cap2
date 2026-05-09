import json
import os
import re
import asyncio
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.modules.ai.ai_schema import ChatMessage, LessonContext

# =========================
# LOAD ENV
# =========================
load_dotenv()


# =========================
# CONFIG
# =========================
def _configure() -> bool:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        print("⚠️ No GEMINI_API_KEY → dùng fallback")
        return False

    try:
        genai.configure(api_key=key)
        return True
    except Exception as e:
        print("⚠️ Gemini config lỗi:", e)
        return False


def _model_name():
    return os.getenv("GEMINI_MODEL", "gemini-1.5-flash")


# =========================
# FALLBACK (ANTI CRASH)
# =========================
def _fallback_chat(ctx: LessonContext, messages: List[ChatMessage]) -> str:
    return f"[MOCK] Bạn hỏi: {messages[-1].text}\n👉 Nội dung bài học: {ctx.title}"


def _fallback_summary(ctx: LessonContext) -> str:
    return f"""# Tóm tắt (MOCK)

- Chủ đề: {ctx.title}
- {ctx.description}
- Nội dung liên quan đến bài học
"""


def _fallback_quiz(num_questions: int):
    return [
        {
            "id": i + 1,
            "question": f"[MOCK] Câu hỏi {i+1}",
            "options": ["A", "B", "C", "D"],
            "correct_index": 0,
        }
        for i in range(num_questions)
    ]


def _fallback_mindmap(ctx: LessonContext):
    return f"""# {ctx.title}

- Ý chính 1
  - Ý nhỏ 1.1
- Ý chính 2
  - Ý nhỏ 2.1
"""


def _fallback_timeline(ctx: LessonContext):
    return [
        {
            "time": "00:00",
            "seconds": 0,
            "label": f"Bắt đầu bài học: {ctx.title}"
        },
        {
            "time": "01:00",
            "seconds": 60,
            "label": "Nội dung chính"
        }
    ]


# =========================
# HELPER
# =========================
def _extract_json(text: str) -> Optional[str]:
    """
    Làm sạch JSON từ Gemini (loại bỏ markdown, text thừa)
    """
    if not text:
        return None

    text = text.strip()

    # remove ```json ```
    text = re.sub(r"```json|```", "", text)

    # tìm array JSON
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        return match.group(0)

    # fallback: object JSON
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)

    return None


async def _call_gemini(prompt: str) -> Optional[str]:
    """
    Core call Gemini với retry + timeout
    """
    if not _configure():
        return None

    model = genai.GenerativeModel(_model_name())

    for attempt in range(3):
        try:
            resp = await asyncio.wait_for(
                model.generate_content_async(prompt),
                timeout=20
            )

            text = (resp.text or "").strip()

            if text:
                return text

        except asyncio.TimeoutError:
            print(f"⚠️ Timeout Gemini (lần {attempt+1})")
        except Exception as e:
            print(f"⚠️ Gemini error (lần {attempt+1}):", e)

        await asyncio.sleep(1.5)

    return None


# =========================
# PUBLIC APIs
# =========================
async def chat_about_lesson(ctx: LessonContext, messages: List[ChatMessage]) -> str:
    prompt = f"""
Bạn là trợ giảng AI. Trả lời NGẮN GỌN, dễ hiểu.

Tiêu đề: {ctx.title}
Mô tả: {ctx.description}

Nội dung bài học:
{ctx.transcript}

Câu hỏi:
{messages[-1].text}

Trả lời:
"""

    result = await _call_gemini(prompt)
    return result or _fallback_chat(ctx, messages)


async def summarize_lesson(ctx: LessonContext, language: str = "Vietnamese") -> str:
    prompt = f"""
Tóm tắt bài học bằng {language}.

YÊU CẦU:
- Ngắn gọn
- Dạng bullet point
- Dễ hiểu

Nội dung:
Tiêu đề: {ctx.title}
Mô tả: {ctx.description}

Transcript:
{ctx.transcript}
"""

    result = await _call_gemini(prompt)
    return result or _fallback_summary(ctx)


async def generate_quiz_json(
    ctx: LessonContext,
    num_questions: int = 5,
    language: str = "Vietnamese"
):
    prompt = f"""
Tạo {num_questions} câu hỏi trắc nghiệm bằng {language}.

YÊU CẦU:
- Trả về JSON array
- KHÔNG thêm text ngoài JSON
- Format:

[
  {{
    "id": 1,
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0
  }}
]

Nội dung:
{ctx.transcript}
"""

    result = await _call_gemini(prompt)

    if not result:
        return _fallback_quiz(num_questions)

    clean_json = _extract_json(result)

    if not clean_json:
        return _fallback_quiz(num_questions)

    try:
        return json.loads(clean_json)
    except Exception as e:
        print("⚠️ JSON parse lỗi:", e)
        return _fallback_quiz(num_questions)


async def generate_mindmap_markdown(
    ctx: LessonContext,
    language: str = "Vietnamese"
):
    prompt = f"""
Tạo mindmap dạng markdown bằng {language}.

YÊU CẦU:
- Dạng cây
- Dùng dấu "-"

Ví dụ:
- Chủ đề
  - Ý 1
  - Ý 2

Nội dung:
{ctx.transcript}
"""

    result = await _call_gemini(prompt)
    return result or _fallback_mindmap(ctx)


async def generate_timeline_json(
    ctx: LessonContext,
    language: str = "Vietnamese"
):
    prompt = f"""
Tạo các mốc thời gian quan trọng (timeline) cho bài học bằng {language}.
Dựa vào transcript hoặc mô tả, hãy trích xuất các khoảnh khắc (key moments).
Nếu transcript không có timestamp, hãy tự ước lượng khoảng thời gian hợp lý (ví dụ mỗi ý chính cách nhau vài phút).

YÊU CẦU:
- Trả về JSON array
- KHÔNG thêm text ngoài JSON
- Format:

[
  {{
    "time": "00:00",
    "seconds": 0,
    "label": "Giới thiệu"
  }},
  {{
    "time": "01:30",
    "seconds": 90,
    "label": "Khái niệm chính"
  }}
]

Nội dung:
Tiêu đề: {ctx.title}
Mô tả: {ctx.description}
Transcript: {ctx.transcript}
"""

    result = await _call_gemini(prompt)

    if not result:
        return _fallback_timeline(ctx)

    clean_json = _extract_json(result)

    if not clean_json:
        return _fallback_timeline(ctx)

    try:
        return json.loads(clean_json)
    except Exception as e:
        print("⚠️ JSON parse lỗi:", e)
        return _fallback_timeline(ctx)