import json
import os
import re
import asyncio
import traceback
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.modules.ai.ai_schema import ChatMessage, LessonContext



# =========================
# LOAD ENV
# =========================
load_dotenv()


class GeminiService:
    # =========================
    # GLOBAL CONFIG
    # =========================
    _configured = False


    def _configure() -> bool:
        global _configured

        if _configured:
            return True

        key = os.getenv("GEMINI_API_KEY", "").strip()
        if not key:
            print("⚠️ Missing GEMINI_API_KEY")
            return False

        try:
            genai.configure(api_key=key)
            _configured = True
            return True
        except Exception:
            print("❌ Gemini config error")
            print(traceback.format_exc())
            return False


    def _model():
        return genai.GenerativeModel(
            os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        )


    # =========================
    # UTIL
    # =========================
    def _trim_text(text: str, max_chars: int = 8000) -> str:
        return text[:max_chars] if text else ""


    def _extract_json(text: str) -> Optional[str]:
        if not text:
            return None

        text = re.sub(r"```json|```", "", text.strip())

        # non-greedy match
        match = re.search(r"\[\s*{.*?}\s*\]", text, re.DOTALL)
        if match:
            return match.group(0)

        match = re.search(r"\{.*?\}", text, re.DOTALL)
        if match:
            return match.group(0)

        return None


    # =========================
    # CORE CALL
    # =========================
    async def _call_gemini(prompt: str) -> Optional[str]:
        if not _configure():
            return None

        model = _model()

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
            except Exception:
                print(f"❌ Gemini error (lần {attempt+1})")
                print(traceback.format_exc())

            await asyncio.sleep(1.5)

        return None


    # =========================
    # FALLBACK
    # =========================
    def _fallback_chat(ctx: LessonContext, messages: List[ChatMessage]) -> str:
        return f"[MOCK] Bạn hỏi: {messages[-1].text}\n👉 Nội dung: {ctx.title}"


    def _fallback_summary(ctx: LessonContext) -> str:
        return f"""# Tóm tắt (MOCK)

    - Chủ đề: {ctx.title}
    - {ctx.description}
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

    - Ý chính
    - Ý nhỏ
    """


    # =========================
    # PUBLIC APIs
    # =========================
    async def chat_about_lesson(
        ctx: LessonContext,
        messages: List[ChatMessage]
    ) -> str:
        transcript = _trim_text(ctx.transcript)

        prompt = f"""
    Bạn là trợ giảng AI.

    QUY TẮC:
    - Chỉ được dùng transcript
    - Không suy đoán
    - Nếu không có thông tin → "Không có trong bài học"
    - Trả lời tối đa 150 từ

    ====================
    {transcript}
    ====================

    Câu hỏi:
    {messages[-1].text}

    Trả lời:
    """

        result = await _call_gemini(prompt)
        return result or _fallback_chat(ctx, messages)


    async def summarize_lesson(
        ctx: LessonContext,
        language: str = "Vietnamese"
    ) -> str:
        transcript = _trim_text(ctx.transcript)

        prompt = f"""
    Tóm tắt bài học bằng {language}.

    YÊU CẦU:
    - Bullet point
    - Ngắn gọn
    - Dễ hiểu
    - Tối đa 150 từ

    ====================
    {transcript}
    ====================
    """

        result = await _call_gemini(prompt)
        return result or _fallback_summary(ctx)


    async def generate_quiz_json(
        ctx: LessonContext,
        num_questions: int = 5,
        language: str = "Vietnamese"
    ):
        transcript = _trim_text(ctx.transcript)

        prompt = f"""
    Tạo {num_questions} câu hỏi trắc nghiệm bằng {language}.

    QUY TẮC:
    - Chỉ trả JSON
    - Không thêm text ngoài JSON

    FORMAT:
    [
    {{
        "id": 1,
        "question": "...",
        "options": ["A","B","C","D"],
        "correct_index": 0
    }}
    ]

    NỘI DUNG:
    {transcript}
    """

        result = await _call_gemini(prompt)

        if not result:
            return _fallback_quiz(num_questions)

        clean = _extract_json(result)

        if not clean:
            return _fallback_quiz(num_questions)

        try:
            return json.loads(clean)
        except Exception:
            print("❌ JSON parse lỗi")
            return _fallback_quiz(num_questions)


    async def generate_mindmap_markdown(
        ctx: LessonContext,
        language: str = "Vietnamese"
    ):
        transcript = _trim_text(ctx.transcript)

        prompt = f"""
    Tạo mindmap markdown bằng {language}.

    YÊU CẦU:
    - Dạng cây
    - Dùng "-"
    - Ngắn gọn

    ====================
    {transcript}
    ====================
    """

        result = await _call_gemini(prompt)
        return result or _fallback_mindmap(ctx)

gemini_service = GeminiService()