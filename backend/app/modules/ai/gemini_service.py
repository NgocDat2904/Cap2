import json
import os
import re
import asyncio
import traceback
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.modules.ai.ai_schema import (
    ChatMessage,
    LessonContext
)

# =========================
# LOAD ENV
# =========================

load_dotenv()


class GeminiService:

    # =========================
    # GLOBAL CONFIG
    # =========================

    _configured = False

    # =========================
    # CONFIGURE GEMINI
    # =========================

    @staticmethod
    def _configure() -> bool:

        if GeminiService._configured:
            return True

        key = os.getenv(
            "GEMINI_API_KEY",
            ""
        ).strip()

        if not key:

            print(
                "⚠️ Missing GEMINI_API_KEY"
            )

            return False

        try:

            genai.configure(
                api_key=key
            )

            GeminiService._configured = True

            print(
                "✅ Gemini configured"
            )

            return True

        except Exception:

            print(
                "❌ Gemini config error"
            )

            print(
                traceback.format_exc()
            )

            return False

    # =========================
    # GET MODEL
    # =========================

    @staticmethod
    def _model():

        return genai.GenerativeModel(
            os.getenv(
                "GEMINI_MODEL",
                "gemini-1.5-flash"
            )
        )

    # =========================
    # UTIL
    # =========================

    @staticmethod
    def _trim_text(
        text: str,
        max_chars: int = 8000
    ) -> str:

        return (
            text[:max_chars]
            if text
            else ""
        )

    @staticmethod
    def _extract_json(
        text: str
    ) -> Optional[str]:

        if not text:
            return None

        text = re.sub(
            r"```json|```",
            "",
            text.strip()
        )

        match = re.search(
            r"\[\s*{.*?}\s*\]",
            text,
            re.DOTALL
        )

        if match:
            return match.group(0)

        match = re.search(
            r"\{.*?\}",
            text,
            re.DOTALL
        )

        if match:
            return match.group(0)

        return None

    # =========================
    # CORE CALL
    # =========================

    @staticmethod
    async def _call_gemini(
        prompt: str
    ) -> Optional[str]:

        if not GeminiService._configure():
            return None

        model = GeminiService._model()

        for attempt in range(3):

            try:

                response = await asyncio.wait_for(
                    model.generate_content_async(
                        prompt
                    ),
                    timeout=20
                )

                text = (
                    response.text or ""
                ).strip()

                if text:
                    return text

            except asyncio.TimeoutError:

                print(
                    f"⚠️ Timeout Gemini ({attempt+1})"
                )

            except Exception:

                print(
                    f"❌ Gemini Error ({attempt+1})"
                )

                print(
                    traceback.format_exc()
                )

            await asyncio.sleep(1.5)

        return None

    # =========================
    # FALLBACKS
    # =========================

    @staticmethod
    def _fallback_chat(
        ctx: LessonContext,
        messages: List[ChatMessage]
    ) -> str:

        return (
            f"[MOCK] Bạn hỏi: "
            f"{messages[-1].text}\n"
            f"👉 Nội dung: {ctx.title}"
        )

    @staticmethod
    def _fallback_summary(
        ctx: LessonContext
    ) -> str:

        return f"""
# Tóm tắt (MOCK)

- Chủ đề: {ctx.title}
- {ctx.description}
"""

    @staticmethod
    def _fallback_quiz(
        num_questions: int
    ):

        return [
            {
                "id": i + 1,
                "question": f"[MOCK] Câu hỏi {i+1}",
                "options": [
                    "A",
                    "B",
                    "C",
                    "D"
                ],
                "correct_index": 0,
            }
            for i in range(num_questions)
        ]

    @staticmethod
    def _fallback_mindmap(
        ctx: LessonContext
    ):

        return f"""
# {ctx.title}

- Ý chính
  - Ý nhỏ
"""

    # =========================
    # CHAT ABOUT LESSON
    # =========================

    async def chat_about_lesson(
        self,
        lesson_content: str,
        question: str
    ):

        if not GeminiService._configure():

            return (
                "Gemini chưa cấu hình."
            )

        try:

            prompt = f"""
Bạn là AI hỗ trợ học tập.

NỘI DUNG BÀI HỌC:
{lesson_content}

CÂU HỎI HỌC VIÊN:
{question}

YÊU CẦU:
- Trả lời bằng tiếng Việt
- Dễ hiểu
- Ngắn gọn
"""

            model = GeminiService._model()

            response = model.generate_content(
                prompt
            )

            return (
                response.text
                if response.text
                else "Không có phản hồi."
            )

        except Exception:

            print(
                "❌ Chat AI Error"
            )

            print(
                traceback.format_exc()
            )

            return (
                "AI đang bận, vui lòng thử lại."
            )

    # =========================
    # SUMMARIZE
    # =========================

    async def summarize_lesson(
        self,
        ctx: LessonContext,
        language: str = "Vietnamese"
    ) -> str:

        transcript = GeminiService._trim_text(
            ctx.transcript
        )

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

        result = await GeminiService._call_gemini(
            prompt
        )

        return (
            result
            or GeminiService._fallback_summary(ctx)
        )

    # =========================
    # GENERATE QUIZ
    # =========================

    async def generate_quiz_json(
        self,
        ctx: LessonContext,
        num_questions: int = 5,
        language: str = "Vietnamese"
    ):

        transcript = GeminiService._trim_text(
            ctx.transcript
        )

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

        result = await GeminiService._call_gemini(
            prompt
        )

        if not result:
            return GeminiService._fallback_quiz(
                num_questions
            )

        clean = GeminiService._extract_json(
            result
        )

        if not clean:
            return GeminiService._fallback_quiz(
                num_questions
            )

        try:

            return json.loads(clean)

        except Exception:

            print(
                "❌ JSON parse error"
            )

            return GeminiService._fallback_quiz(
                num_questions
            )

    # =========================
    # GENERATE MINDMAP
    # =========================

    async def generate_mindmap_markdown(
        self,
        ctx: LessonContext,
        language: str = "Vietnamese"
    ):

        transcript = GeminiService._trim_text(
            ctx.transcript
        )

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

        result = await GeminiService._call_gemini(
            prompt
        )

        return (
            result
            or GeminiService._fallback_mindmap(ctx)
        )


# =========================
# INSTANCE
# =========================

gemini_service = GeminiService()

# =========================
# EXPORT FUNCTIONS
# =========================

chat_about_lesson = (
    gemini_service.chat_about_lesson
)

summarize_lesson = (
    gemini_service.summarize_lesson
)