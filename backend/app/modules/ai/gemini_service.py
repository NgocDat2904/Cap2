import json
import os
import re
import asyncio
from typing import List

import google.generativeai as genai
from dotenv import load_dotenv

from app.modules.ai.ai_schema import ChatMessage, LessonContext

# 👉 Load env
load_dotenv()


# =========================
# CONFIG
# =========================
def _configure():
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
    return os.getenv("GEMINI_MODEL", "gemini-1.5-pro")


# =========================
# FALLBACK (CỰC QUAN TRỌNG)
# =========================
def _fallback_chat(ctx: LessonContext, messages: List[ChatMessage]) -> str:
    return f"[MOCK] Bạn hỏi: {messages[-1].text}\n👉 Nội dung bài học nói về: {ctx.title}"


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


# =========================
# CORE CALL (có retry)
# =========================
async def _call_gemini(prompt: str):
    if not _configure():
        return None

    model = genai.GenerativeModel(_model_name())

    for attempt in range(3):  # retry 3 lần
        try:
            resp = await model.generate_content_async(prompt)
            text = (resp.text or "").strip()
            if text:
                return text
        except Exception as e:
            print(f"⚠️ Gemini error (lần {attempt+1}):", e)
            await asyncio.sleep(2)

    return None


# =========================
# PUBLIC APIs
# =========================
async def chat_about_lesson(ctx: LessonContext, messages: List[ChatMessage]) -> str:
    prompt = f"""
Bạn là trợ giảng. Trả lời dựa trên bài học.

Tiêu đề: {ctx.title}
Mô tả: {ctx.description}
Nội dung: {ctx.transcript}

Câu hỏi: {messages[-1].text}
Trả lời:
"""

    result = await _call_gemini(prompt)
    return result or _fallback_chat(ctx, messages)


async def summarize_lesson(ctx: LessonContext, language: str) -> str:
    prompt = f"""
Tóm tắt bài học bằng {language}:

{ctx.title}
{ctx.description}
{ctx.transcript}
"""

    result = await _call_gemini(prompt)
    return result or _fallback_summary(ctx)


async def generate_quiz_json(ctx: LessonContext, num_questions: int, language: str):
    prompt = f"""
Tạo {num_questions} câu hỏi trắc nghiệm JSON:

{ctx.transcript}
"""

    result = await _call_gemini(prompt)
    if not result:
        return _fallback_quiz(num_questions)

    try:
        data = json.loads(result)
        return data
    except:
        return _fallback_quiz(num_questions)


async def generate_mindmap_markdown(ctx: LessonContext, language: str):
    prompt = f"""
Tạo mindmap markdown:

{ctx.transcript}
"""

    result = await _call_gemini(prompt)
    return result or _fallback_mindmap(ctx)