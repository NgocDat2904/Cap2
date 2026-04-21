import json
import os
import re
from typing import List, Optional

import google.generativeai as genai

from app.modules.ai.ai_schema import ChatMessage, LessonContext


def _configure() -> None:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=key)


def _model_name() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()


def _context_block(ctx: LessonContext) -> str:
    parts = [f"Tiêu đề: {ctx.title}"]
    if ctx.description:
        parts.append(f"Mô tả: {ctx.description}")
    if ctx.transcript and ctx.transcript.strip():
        parts.append(f"Transcript / nội dung chi tiết:\n{ctx.transcript.strip()}")
    return "\n\n".join(parts)


def _ensure_configured() -> genai.GenerativeModel:
    _configure()
    return genai.GenerativeModel(_model_name())


async def chat_about_lesson(
    ctx: LessonContext,
    messages: List[ChatMessage],
) -> str:
    model = _ensure_configured()
    block = _context_block(ctx)
    system = (
        "Bạn là trợ giảng của khóa học. Chỉ trả lời dựa trên ngữ cảnh bài học. "
        "Nếu câu hỏi không liên quan hoặc nội dung không có trong ngữ cảnh, nói rõ không có trong bài/video. "
        "Trả lời ngắn gọn, rõ ràng, thân thiện.\n\n"
        f"Ngữ cảnh bài học:\n{block}"
    )

    lines: List[str] = []
    for m in messages:
        role = "Trợ giảng" if m.is_ai else "Học viên"
        lines.append(f"{role}: {m.text}")
    prompt = system + "\n\n" + "\n".join(lines) + "\nTrợ giảng:"

    resp = await model.generate_content_async(prompt)
    text = (resp.text or "").strip()
    if not text:
        raise RuntimeError("Gemini returned empty response")
    return text


async def summarize_lesson(ctx: LessonContext, language: str) -> str:
    model = _ensure_configured()
    block = _context_block(ctx)
    lang = "tiếng Việt" if language.lower().startswith("vi") else language
    prompt = (
        f"Tóm tắt nội dung bài học sau bằng {lang}. "
        "Dùng gạch đầu dòng cho các ý chính. Không bịa thêm ngoài ngữ cảnh.\n\n"
        f"{block}"
    )
    resp = await model.generate_content_async(prompt)
    text = (resp.text or "").strip()
    if not text:
        raise RuntimeError("Gemini returned empty summary")
    return text


async def generate_quiz_json(
    ctx: LessonContext,
    num_questions: int,
    language: str,
) -> List[dict]:
    model = _ensure_configured()
    block = _context_block(ctx)
    lang = "tiếng Việt" if language.lower().startswith("vi") else language
    prompt = (
        f"Tạo đúng {num_questions} câu hỏi trắc nghiệm 4 đáp án (một đáp án đúng) dựa CHỈ trên ngữ cảnh. "
        f"Ngôn ngữ: {lang}. "
        "Trả về MỘT mảng JSON hợp lệ, không markdown, không giải thích thêm, format:\n"
        '[{"question":"...","options":["a","b","c","d"],"correct_index":0}]\n'
        "correct_index là 0–3.\n\n"
        f"Ngữ cảnh:\n{block}"
    )
    resp = await model.generate_content_async(prompt)
    raw = (resp.text or "").strip()
    if not raw:
        raise RuntimeError("Gemini returned empty quiz")

    cleaned = raw
    if "```" in cleaned:
        m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if m:
            cleaned = m.group(1).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("[")
        end = cleaned.rfind("]")
        if start != -1 and end != -1 and end > start:
            data = json.loads(cleaned[start : end + 1])
        else:
            raise RuntimeError("Could not parse quiz JSON from Gemini") from None

    if not isinstance(data, list):
        raise RuntimeError("Quiz must be a JSON array")
    out: List[dict] = []
    for i, item in enumerate(data[:num_questions]):
        if not isinstance(item, dict):
            continue
        q = item.get("question", "")
        opts = item.get("options", [])
        idx = item.get("correct_index", 0)
        if not isinstance(opts, list) or len(opts) < 2:
            continue
        out.append(
            {
                "id": i + 1,
                "question": str(q),
                "options": [str(x) for x in opts[:4]],
                "correct_index": int(idx) % len(opts[:4]),
            }
        )
    if not out:
        raise RuntimeError("No valid quiz items parsed")
    return out


async def generate_mindmap_markdown(ctx: LessonContext, language: str) -> str:
    model = _ensure_configured()
    block = _context_block(ctx)
    lang = "tiếng Việt" if language.lower().startswith("vi") else language
    prompt = (
        "Bạn tạo mindmap dạng Markdown để render bằng markmap. "
        "Chỉ dựa trên nội dung ngữ cảnh, không bịa thêm. "
        f"Ngôn ngữ: {lang}. "
        "Định dạng bắt buộc:\n"
        "# Chủ đề chính\n"
        "- Nhánh 1\n"
        "  - Ý nhỏ 1.1\n"
        "- Nhánh 2\n"
        "  - Ý nhỏ 2.1\n"
        "    - Ý nhỏ 2.1.1\n"
        "- Nhánh 3\n"
        "Không dùng code fence, không dùng giải thích ngoài markdown.\n\n"
        f"Ngữ cảnh:\n{block}"
    )
    resp = await model.generate_content_async(prompt)
    text = (resp.text or "").strip()
    if not text:
        raise RuntimeError("Gemini returned empty mindmap")

    cleaned = text
    if "```" in cleaned:
        m = re.search(r"```(?:markdown|md)?\s*([\s\S]*?)\s*```", cleaned)
        if m:
            cleaned = m.group(1).strip()

    if not cleaned.lstrip().startswith("#"):
        cleaned = f"# {ctx.title}\n\n{cleaned}"
    return cleaned
