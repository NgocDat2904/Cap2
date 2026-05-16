import json
import os
import re
import asyncio
from typing import List, Optional

from google import genai
from dotenv import load_dotenv

from app.modules.ai.ai_schema import ChatMessage, LessonContext

# =========================
# LOAD ENV
# =========================
load_dotenv()


# =========================
# CONFIG
# =========================
_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client

    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        print("⚠️ No GEMINI_API_KEY → dùng fallback")
        return None

    try:
        _client = genai.Client(api_key=key)
        return _client
    except Exception as e:
        print("Gemini client init lỗi:", e)
        return None


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
    safe_title = (ctx.title or "Video").replace('"', "'").replace('(', '').replace(')', '')
    return f"""# {safe_title}

## Ý chính 1

### Ý nhỏ 1.1

## Ý chính 2

### Ý nhỏ 2.1
"""




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
    Core call Gemini với retry + timeout (ASYNC)
    """
    client = _get_client()
    if not client:
        return None

    model_id = _model_name()

    for attempt in range(3):
        try:
            # google-genai SDK uses client.aio for async
            resp = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model=model_id,
                    contents=prompt
                ),
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


def _call_gemini_sync(prompt: str) -> Optional[str]:
    """
    Core call Gemini SYNC — dùng cho background task (không cần asyncio).
    """
    client = _get_client()
    if not client:
        print("⚠️ [SYNC] Gemini client chưa init, bỏ qua")
        return None

    import time
    model_id = _model_name()

    for attempt in range(3):
        try:
            resp = client.models.generate_content(
                model=model_id,
                contents=prompt
            )

            text = (resp.text or "").strip()

            if text:
                return text

        except Exception as e:
            print(f"⚠️ [SYNC] Gemini error (lần {attempt+1}):", e)

        time.sleep(1.5)

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
- Mỗi câu hỏi phải có:
  + question
  + options
  + correct_index
  + explanation

FORMAT:

[
  {{
    "id": 1,
    "question": "Câu hỏi?",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "correct_index": 0,
    "explanation": "Giải thích vì sao đáp án đúng."
  }}
]

Nội dung bài học:

Tiêu đề:
{ctx.title}

Mô tả:
{ctx.description}

Transcript:
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


def _extract_markmap_code(text: str) -> Optional[str]:
    """
    Trích xuất Markmap (markdown heading) code từ output Gemini.
    Loại bỏ ```markdown, ``` và text thừa.
    """
    if not text:
        return None

    text = text.strip()

    # Tìm block ```markdown ... ```
    match = re.search(r"```(?:markdown|md)\s*\n(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()

    # Tìm block bắt đầu bằng heading "# "
    match = re.search(r"(^#\s+.+$.*)", text, re.DOTALL | re.MULTILINE)
    if match:
        code = match.group(1).strip()
        # Loại bỏ ``` cuối nếu có
        code = re.sub(r"```\s*$", "", code).strip()
        return code

    return None


async def generate_markmap_mindmap(
    ctx: LessonContext,
    language: str = "Vietnamese"
):
    prompt = f"""
Bạn là một AI chuyên phân tích nội dung video và chuyển thành mindmap.

Nhiệm vụ:
- Đọc transcript bên dưới
- Tóm tắt lại thành các ý chính
- Chuyển thành mindmap theo format Markdown Heading (dùng cho thư viện Markmap)

Yêu cầu:
1. Heading cấp 1 (#) = chủ đề chính của video (chỉ 1 dòng duy nhất)
2. Heading cấp 2 (##) = các mục lớn
3. Heading cấp 3 (###) = ý chính trong từng mục
4. Heading cấp 4 (####) = chi tiết (nếu cần)
5. Có thể dùng bullet list (- ) cho các chi tiết nhỏ bên trong heading
6. Ngắn gọn, không dài dòng
7. Không copy nguyên văn, phải tóm tắt
8. Giữ cấu trúc rõ ràng, dễ đọc
9. Sử dụng ngôn ngữ {language}
10. KHÔNG dùng ký tự đặc biệt hoặc HTML trong nội dung

Output chỉ gồm nội dung Markdown, không giải thích.

Format mẫu:
# Chủ đề chính

## Mục lớn 1

### Ý chính 1.1

- Chi tiết a
- Chi tiết b

### Ý chính 1.2

## Mục lớn 2

### Ý chính 2.1

Transcript:
{ctx.transcript}
"""

    result = await _call_gemini(prompt)

    if not result:
        return _fallback_mindmap(ctx)

    markmap_code = _extract_markmap_code(result)

    if not markmap_code:
        # Nếu không extract được, thử dùng nguyên text (có thể Gemini trả clean)
        if result.strip().startswith("#"):
            return result.strip()
        return _fallback_mindmap(ctx)

    return markmap_code


def _build_markmap_prompt(ctx: LessonContext, language: str = "Vietnamese") -> str:
    """Prompt dùng chung cho cả async và sync."""
    return f"""
Bạn là một AI chuyên phân tích nội dung video và chuyển thành mindmap.

Nhiệm vụ:
- Đọc transcript bên dưới
- Tóm tắt lại thành các ý chính
- Chuyển thành mindmap theo format Markdown Heading (dùng cho thư viện Markmap)

Yêu cầu:
1. Heading cấp 1 (#) = chủ đề chính của video (chỉ 1 dòng duy nhất)
2. Heading cấp 2 (##) = các mục lớn
3. Heading cấp 3 (###) = ý chính trong từng mục
4. Heading cấp 4 (####) = chi tiết (nếu cần)
5. Có thể dùng bullet list (- ) cho các chi tiết nhỏ bên trong heading
6. Ngắn gọn, không dài dòng
7. Không copy nguyên văn, phải tóm tắt
8. Giữ cấu trúc rõ ràng, dễ đọc
9. Sử dụng ngôn ngữ {language}
10. KHÔNG dùng ký tự đặc biệt hoặc HTML trong nội dung

Output chỉ gồm nội dung Markdown, không giải thích.

Format mẫu:
# Chủ đề chính

## Mục lớn 1

### Ý chính 1.1

- Chi tiết a
- Chi tiết b

### Ý chính 1.2

## Mục lớn 2

### Ý chính 2.1

Transcript:
{ctx.transcript}
"""


def generate_markmap_mindmap_sync(
    ctx: LessonContext,
    language: str = "Vietnamese"
) -> Optional[str]:
    """
    SYNC version — dùng cho background task (video_service).
    """
    prompt = _build_markmap_prompt(ctx, language)
    result = _call_gemini_sync(prompt)

    if not result:
        print("[MINDMAP] Gemini trả về None → không tạo mindmap")
        return None

    markmap_code = _extract_markmap_code(result)

    if not markmap_code:
        if result.strip().startswith("#"):
            return result.strip()
        print("[MINDMAP] Không extract được Markmap code từ Gemini output")
        return None

    return markmap_code


def summarize_lesson_sync(
    ctx: LessonContext,
    language: str = "Vietnamese"
) -> Optional[str]:
    """
    SYNC version — dùng cho background task (video_service).
    """
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
    result = _call_gemini_sync(prompt)
    if not result:
        print("[SUMMARY] Gemini trả về None → không tạo summary")
        return None
    return result


def enhance_timeline_labels_sync(
    timeline_items: list,
    language: str = "vi",
) -> list:
    """
    Dùng Gemini để đặt tên chapter ngắn gọn cho từng entry trong timeline.

    - Timestamps KHÔNG bao giờ thay đổi — chỉ label được AI đặt lại.
    - Nếu AI lỗi / trả về sai số lượng → giữ nguyên label gốc (truncated text).
    - Field "_raw_text" được dùng làm input cho AI, không được lưu DB.

    Args:
        timeline_items: list có field "time", "seconds", "label", "_raw_text"
        language:       ngôn ngữ đầu ra (mặc định "vi")

    Returns:
        list với label đã được AI enhance, "_raw_text" đã được xóa
    """
    if not timeline_items:
        return []

    # Chỉ enhance các item có _raw_text
    items_to_enhance = [i for i in timeline_items if i.get("_raw_text")]
    if not items_to_enhance:
        # Không có raw text → trả về như cũ, strip _raw_text nếu có
        return [{k: v for k, v in item.items() if k != "_raw_text"} for item in timeline_items]

    # Build input cho prompt
    input_list = json.dumps(
        [{"seconds": item["seconds"], "text": item["_raw_text"]} for item in items_to_enhance],
        ensure_ascii=False,
        indent=2,
    )

    lang_name = "tiếng Việt" if language in ("vi", "vn") else language

    prompt = f"""Bạn là AI đặt tên chapter cho video bài giảng.

Dưới đây là {len(items_to_enhance)} đoạn transcript kèm timestamp (giây).
Hãy đặt tên chapter ngắn gọn (3-5 từ bằng {lang_name}) cho từng đoạn.

YÊU CẦU:
- Mỗi tên phản ánh ý chính của đoạn
- Ngắn gọn, súc tích (3-5 từ), KHÔNG dài dòng
- Trả về JSON array gồm đúng {len(items_to_enhance)} chuỗi, theo đúng thứ tự
- KHÔNG thêm bất kỳ text nào ngoài JSON array

Input:
{input_list}

Output (chỉ JSON array):
["Tên chapter 1", "Tên chapter 2", ...]
"""

    raw = _call_gemini_sync(prompt)
    if not raw:
        print("[TIMELINE_ENHANCE] Gemini trả về None → giữ label gốc")
        return [{k: v for k, v in item.items() if k != "_raw_text"} for item in timeline_items]

    clean = _extract_json(raw)
    if not clean:
        print("[TIMELINE_ENHANCE] Không parse được JSON → giữ label gốc")
        return [{k: v for k, v in item.items() if k != "_raw_text"} for item in timeline_items]

    try:
        labels = json.loads(clean)
    except Exception as e:
        print(f"[TIMELINE_ENHANCE] JSON parse lỗi: {e} → giữ label gốc")
        return [{k: v for k, v in item.items() if k != "_raw_text"} for item in timeline_items]

    if not isinstance(labels, list) or len(labels) != len(items_to_enhance):
        print(
            f"[TIMELINE_ENHANCE] Số lượng label không khớp "
            f"({len(labels)} vs {len(items_to_enhance)}) → giữ label gốc"
        )
        return [{k: v for k, v in item.items() if k != "_raw_text"} for item in timeline_items]

    # Merge: gán label mới vào đúng vị trí, giữ item không có _raw_text nguyên vẹn
    enhance_idx = 0
    result = []
    for item in timeline_items:
        clean_item = {k: v for k, v in item.items() if k != "_raw_text"}
        if item.get("_raw_text"):
            ai_label = str(labels[enhance_idx]).strip()
            if ai_label:
                clean_item["label"] = ai_label
            enhance_idx += 1
        result.append(clean_item)

    print(f"[TIMELINE_ENHANCE] Enhanced {len(items_to_enhance)} chapter labels thành công")
    return result
