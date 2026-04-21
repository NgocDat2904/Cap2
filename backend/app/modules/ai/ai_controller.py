from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.middleware.auth_middleware import require_role
from app.modules.ai.ai_schema import (
    ChatRequest,
    SummaryRequest,
    QuizRequest,
    VideoChatRequest,
    VideoSummaryRequest,
    VideoQuizRequest,
    MindmapRequest,
    VideoMindmapRequest,
    LessonContext,
)
from app.modules.ai import gemini_service
from app.database.mongodb import db

router = APIRouter(prefix="/learner/ai", tags=["learner-ai"])


def _video_doc(video_id: str) -> dict:
    if not ObjectId.is_valid(video_id):
        raise HTTPException(400, "Invalid video_id")
    video = db.videos.find_one({"_id": ObjectId(video_id)})
    if not video:
        raise HTTPException(404, "Video not found")
    return video


def _cache_get(video: dict, key: str):
    return (video.get("ai_cache") or {}).get(key)


def _cache_set(video_id: str, key: str, value):
    db.videos.update_one(
        {"_id": ObjectId(video_id)},
        {
            "$set": {
                f"ai_cache.{key}": value,
                "updated_at": datetime.utcnow(),
            }
        },
    )


def _context_from_video(video_id: str) -> LessonContext:
    video = _video_doc(video_id)

    transcript = (video.get("transcript") or "").strip()
    if not transcript:
        raise HTTPException(409, "Video chưa có transcript, vui lòng xử lý STT trước")

    return LessonContext(
        title=video.get("title") or "Video lesson",
        description=video.get("description") or "",
        transcript=transcript,
    )


@router.post("/chat")
async def ai_chat(
    body: ChatRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    try:
        text = await gemini_service.chat_about_lesson(body.context, body.messages)
        return {"reply": text}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")


@router.post("/summary")
async def ai_summary(
    body: SummaryRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    try:
        text = await gemini_service.summarize_lesson(body.context, body.language)
        return {"summary": text}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")


@router.post("/quiz")
async def ai_quiz(
    body: QuizRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    try:
        items = await gemini_service.generate_quiz_json(
            body.context,
            body.num_questions,
            body.language,
        )
        return {"questions": items}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")


@router.post("/chat-by-video")
async def ai_chat_by_video(
    body: VideoChatRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    context = _context_from_video(body.video_id)
    # Cache theo câu hỏi cuối cùng của learner (case-insensitive)
    latest_question = ""
    for msg in reversed(body.messages):
        if not msg.is_ai:
            latest_question = (msg.text or "").strip()
            break
    if latest_question:
        v = _video_doc(body.video_id)
        chat_items = _cache_get(v, "chat_items") or []
        q_norm = latest_question.lower()
        for item in chat_items:
            if str(item.get("q_norm", "")).lower() == q_norm:
                return {"reply": item.get("reply", "")}

    try:
        text = await gemini_service.chat_about_lesson(context, body.messages)
        if latest_question:
            v = _video_doc(body.video_id)
            chat_items = _cache_get(v, "chat_items") or []
            chat_items.append(
                {
                    "question": latest_question,
                    "q_norm": latest_question.lower(),
                    "reply": text,
                    "created_at": datetime.utcnow().isoformat(),
                }
            )
            # Giữ tối đa 200 cặp hỏi đáp gần nhất
            if len(chat_items) > 200:
                chat_items = chat_items[-200:]
            _cache_set(body.video_id, "chat_items", chat_items)
        return {"reply": text}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")


@router.post("/summary-by-video")
async def ai_summary_by_video(
    body: VideoSummaryRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    video = _video_doc(body.video_id)
    summary_cache = _cache_get(video, "summary") or {}
    cached = summary_cache.get(body.language)
    if cached:
        return {"summary": cached}

    context = _context_from_video(body.video_id)
    try:
        text = await gemini_service.summarize_lesson(context, body.language)
        summary_cache[body.language] = text
        _cache_set(body.video_id, "summary", summary_cache)
        return {"summary": text}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")


@router.post("/quiz-by-video")
async def ai_quiz_by_video(
    body: VideoQuizRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    video = _video_doc(body.video_id)
    quiz_cache = _cache_get(video, "quiz") or {}
    cache_key = f"{body.language}:{body.num_questions}"
    cached = quiz_cache.get(cache_key)
    if cached:
        return {"questions": cached}

    context = _context_from_video(body.video_id)
    try:
        items = await gemini_service.generate_quiz_json(
            context,
            body.num_questions,
            body.language,
        )
        quiz_cache[cache_key] = items
        _cache_set(body.video_id, "quiz", quiz_cache)
        return {"questions": items}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")


@router.post("/mindmap")
async def ai_mindmap(
    body: MindmapRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    try:
        markdown = await gemini_service.generate_mindmap_markdown(
            body.context,
            body.language,
        )
        return {"mindmap_markdown": markdown}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")


@router.post("/mindmap-by-video")
async def ai_mindmap_by_video(
    body: VideoMindmapRequest,
    user=Depends(require_role(["learner"])),
):
    _ = user
    video = _video_doc(body.video_id)
    mindmap_cache = _cache_get(video, "mindmap_markdown") or {}
    cached = mindmap_cache.get(body.language)
    if cached:
        return {"mindmap_markdown": cached}

    context = _context_from_video(body.video_id)
    try:
        markdown = await gemini_service.generate_mindmap_markdown(
            context,
            body.language,
        )
        mindmap_cache[body.language] = markdown
        _cache_set(body.video_id, "mindmap_markdown", mindmap_cache)
        return {"mindmap_markdown": markdown}
    except RuntimeError as e:
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(503, "Chưa cấu hình GEMINI_API_KEY trên server")
        raise HTTPException(503, str(e))
    except Exception as e:
        raise HTTPException(500, f"Gemini error: {e!s}")
