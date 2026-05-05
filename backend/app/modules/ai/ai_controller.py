from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
import re

from app.middleware.auth_middleware import require_role
from app.modules.ai.ai_schema import *
from app.modules.ai import gemini_service
from app.database.mongodb import db

router = APIRouter(prefix="/learner/ai", tags=["learner-ai"])


# =========================
# HELPERS
# =========================
async def _video_doc(video_id: str) -> dict:
    if not ObjectId.is_valid(video_id):
        raise HTTPException(400, "Invalid video_id")

    video = await db.videos.find_one({"_id": ObjectId(video_id)})
    if not video:
        raise HTTPException(404, "Video not found")

    return video


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _cache_get(video: dict, key: str):
    return (video.get("ai_cache") or {}).get(key)


async def _cache_set(video_id: str, key: str, value):
    await db.videos.update_one(
        {"_id": ObjectId(video_id)},
        {
            "$set": {
                f"ai_cache.{key}": value,
                "updated_at": datetime.utcnow(),
            }
        },
    )


def _build_context(video: dict) -> LessonContext:
    transcript = (video.get("transcript") or "").strip()
    if not transcript:
        raise HTTPException(409, "Transcript chưa sẵn sàng")

    return LessonContext(
        title=video.get("title") or "Video lesson",
        description=video.get("description") or "",
        transcript=transcript,
    )


def _handle_ai_error(e: Exception):
    msg = str(e)
    if "GEMINI_API_KEY" in msg:
        raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
    raise HTTPException(500, f"Gemini error: {msg}")


# =========================
# BASIC APIs
# =========================
@router.post("/chat")
async def ai_chat(body: ChatRequest, user=Depends(require_role(["learner"]))):
    try:
        text = await gemini_service.chat_about_lesson(body.context, body.messages)
        return {"reply": text}
    except Exception as e:
        _handle_ai_error(e)


@router.post("/summary")
async def ai_summary(body: SummaryRequest, user=Depends(require_role(["learner"]))):
    try:
        text = await gemini_service.summarize_lesson(body.context, body.language)
        return {"summary": text}
    except Exception as e:
        _handle_ai_error(e)


@router.post("/quiz")
async def ai_quiz(body: QuizRequest, user=Depends(require_role(["learner"]))):
    try:
        items = await gemini_service.generate_quiz_json(
            body.context,
            body.num_questions,
            body.language,
        )
        return {"questions": items}
    except Exception as e:
        _handle_ai_error(e)


@router.post("/mindmap")
async def ai_mindmap(body: MindmapRequest, user=Depends(require_role(["learner"]))):
    try:
        markdown = await gemini_service.generate_mindmap_markdown(
            body.context,
            body.language,
        )
        return {"mindmap_markdown": markdown}
    except Exception as e:
        _handle_ai_error(e)


# =========================
# VIDEO APIs (CÓ CACHE)
# =========================
@router.post("/chat-by-video")
async def ai_chat_by_video(
    body: VideoChatRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)
    context = _build_context(video)

    # lấy câu hỏi cuối
    latest_question = ""
    for msg in reversed(body.messages):
        if not msg.is_ai:
            latest_question = (msg.text or "").strip()
            break

    # check cache
    if latest_question:
        chat_items = _cache_get(video, "chat_items") or []
        q_norm = _normalize(latest_question)

        for item in chat_items:
            if item.get("q_norm") == q_norm:
                return {"reply": item.get("reply")}

    try:
        text = await gemini_service.chat_about_lesson(context, body.messages)

        # lưu cache
        if latest_question:
            chat_items = _cache_get(video, "chat_items") or []

            chat_items.append({
                "question": latest_question,
                "q_norm": _normalize(latest_question),
                "reply": text,
                "created_at": datetime.utcnow().isoformat(),
            })

            chat_items = chat_items[-200:]  # limit

            await _cache_set(body.video_id, "chat_items", chat_items)

        return {"reply": text}

    except Exception as e:
        _handle_ai_error(e)


@router.post("/summary-by-video")
async def ai_summary_by_video(
    body: VideoSummaryRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)

    summary_cache = _cache_get(video, "summary") or {}

    if body.language in summary_cache:
        return {"summary": summary_cache[body.language]}

    context = _build_context(video)

    try:
        text = await gemini_service.summarize_lesson(context, body.language)

        summary_cache[body.language] = text

        # limit cache
        if len(summary_cache) > 10:
            summary_cache = dict(list(summary_cache.items())[-10:])

        await _cache_set(body.video_id, "summary", summary_cache)

        return {"summary": text}

    except Exception as e:
        _handle_ai_error(e)


@router.post("/quiz-by-video")
async def ai_quiz_by_video(
    body: VideoQuizRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)

    quiz_cache = _cache_get(video, "quiz") or {}
    cache_key = f"{body.language}:{body.num_questions}"

    if cache_key in quiz_cache:
        return {"questions": quiz_cache[cache_key]}

    context = _build_context(video)

    try:
        items = await gemini_service.generate_quiz_json(
            context,
            body.num_questions,
            body.language,
        )

        quiz_cache[cache_key] = items

        if len(quiz_cache) > 10:
            quiz_cache = dict(list(quiz_cache.items())[-10:])

        await _cache_set(body.video_id, "quiz", quiz_cache)

        return {"questions": items}

    except Exception as e:
        _handle_ai_error(e)


@router.post("/mindmap-by-video")
async def ai_mindmap_by_video(
    body: VideoMindmapRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)

    cache = _cache_get(video, "mindmap_markdown") or {}

    if body.language in cache:
        return {"mindmap_markdown": cache[body.language]}

    context = _build_context(video)

    try:
        markdown = await gemini_service.generate_mindmap_markdown(
            context,
            body.language,
        )

        cache[body.language] = markdown

        if len(cache) > 10:
            cache = dict(list(cache.items())[-10:])

        await _cache_set(body.video_id, "mindmap_markdown", cache)

        return {"mindmap_markdown": markdown}

    except Exception as e:
        _handle_ai_error(e)