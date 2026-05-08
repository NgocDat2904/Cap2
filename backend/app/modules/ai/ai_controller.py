from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
import re

from app.middleware.auth_middleware import require_role
from app.modules.ai.ai_schema import *
from app.modules.ai.gemini_service import(
    gemini_service
)
from app.database.mongodb import db

router = APIRouter(prefix="/learner/ai", tags=["learner-ai"])


# =========================
# HELPERS
# =========================

async def _video_doc(video_id: str) -> dict:

    if not ObjectId.is_valid(video_id):

        raise HTTPException(
            400,
            "Invalid video_id"
        )

    # =========================================
    # TRY VIDEO _id
    # =========================================

    video = db.videos.find_one({

        "_id": ObjectId(video_id)
    })

    if video:

        return video

    # =========================================
    # TRY lesson_id
    # =========================================

    video = db.videos.find_one({

        "lesson_id": ObjectId(video_id)
    })

    if video:

        return video

    raise HTTPException(

        404,

        "Video not found"
    )




def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def _cache_get(video: dict, key: str):
    return (video.get("ai_cache") or {}).get(key)


def _cache_set(video_id: str, key: str, value):

    db.videos.update_one(
        {"_id": ObjectId(video_id)},
        {
            "$set": {
                f"ai_cache.{key}": value,
                "ai_status": "completed",
                "updated_at": datetime.utcnow(),
            }
        },
    )

def _build_context(video: dict) -> LessonContext:
    print("Video doc:", video)  # debug
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




@router.post("/chat-by-video")
async def ai_chat_by_video(
    body: VideoChatRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)
    context = _build_context(video)



    latest_question = ""

    for msg in reversed(body.messages):

        if not msg.is_ai:

            latest_question = (
                msg.text or ""
            ).strip()

            break

    # =========================================
    # CHECK CACHE
    # =========================================

    if latest_question:

        chat_items = (
            _cache_get(video, "chat_items")
            or []
        )

        q_norm = _normalize(
            latest_question
        )

        for item in chat_items:

            if item.get("q_norm") == q_norm:

                return {
                    "reply":
                    item.get("reply")
                }

    # =========================================
    # GENERATE AI
    # =========================================

    try:

        text = await gemini_service.chat_about_lesson(
            context,
            body.messages
        )

        # =========================================
        # SAVE CACHE
        # =========================================

        if latest_question:

            chat_items = (
                _cache_get(video, "chat_items")
                or []
            )

            chat_items.append({

                "question":
                    latest_question,

                "q_norm":
                    _normalize(
                        latest_question
                    ),

                "reply":
                    text,

                "created_at":
                    datetime.utcnow().isoformat(),
            })

            # LIMIT CACHE
            chat_items = chat_items[-200:]

            _cache_set(
                body.video_id,
                "chat_items",
                chat_items
            )

        return {
            "reply": text
        }

    except Exception as e:

        _handle_ai_error(e)

@router.post("/summary-by-video")
async def ai_summary_by_video(
    body: VideoSummaryRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)

    summary = (
        video.get("ai_cache", {})
        .get("summary")
    )

    # AUTO GENERATE
    if not summary:

        context = _build_context(video)

        try:

            summary = await gemini_service.summarize_lesson(
                context,
                body.language,
            )

            _cache_set(
                body.video_id,
                "summary",
                summary
            )

        except Exception as e:
            _handle_ai_error(e)

    return {
        "summary": summary
    }


# =========================================
# MINDMAP BY VIDEO
# =========================================

@router.post("/mindmap-by-video")
async def ai_mindmap_by_video(
    body: VideoMindmapRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)

    mindmap = (
        video.get("ai_cache", {})
        .get("mindmap")
    )

    # AUTO GENERATE
    if not mindmap:

        context = _build_context(video)

        try:

            mindmap = await gemini_service.generate_mindmap_markdown(
                context,
                body.language,
            )

            _cache_set(
                body.video_id,
                "mindmap",
                mindmap
            )

        except Exception as e:
            _handle_ai_error(e)

    return {
        "mindmap_markdown": mindmap
    }


# =========================================
# QUIZ BY VIDEO
# =========================================

@router.post("/quiz-by-video")
async def ai_quiz_by_video(
    body: VideoQuizRequest,
    user=Depends(require_role(["learner"]))
):
    video = await _video_doc(body.video_id)

    quiz_cache = (
        _cache_get(video, "quiz")
        or {}
    )

    cache_key = (
        f"{body.language}:"
        f"{body.num_questions}"
    )

    # CACHE HIT
    if cache_key in quiz_cache:

        return {
            "questions":
            quiz_cache[cache_key]
        }

    context = _build_context(video)

    try:

        items = await gemini_service.generate_quiz_json(
            context,
            body.num_questions,
            body.language,
        )

        quiz_cache[cache_key] = items

        if len(quiz_cache) > 10:
            quiz_cache = dict(
                list(
                    quiz_cache.items()
                )[-10:]
            )

        _cache_set(
            body.video_id,
            "quiz",
            quiz_cache
        )

        return {
            "questions": items
        }

    except Exception as e:
        _handle_ai_error(e)


    video = await _video_doc(body.video_id)

    mindmap = (
        video.get("ai_cache", {})
        .get("mindmap")
    )

    if not mindmap:
        raise HTTPException(
            status_code=404,
            detail="Mindmap chưa được generate"
        )

    return {
        "mindmap_markdown": mindmap
    }