from bson import ObjectId

from app.database.mongodb import db
from app.modules.ai.gemini_service import gemini_service
from app.modules.video.video_service import video_service


async def generate_ai_for_video(video_id: str):

    video = db.videos.find_one({
        "_id": ObjectId(video_id)
    })

    if not video:
        return

    # =========================
    # GENERATE TRANSCRIPT
    # =========================

    transcript = video.get("transcript")

    if not transcript:

        await video_service.generate_transcript(
            video_id=video_id,
            instructor_id=str(
                db.courses.find_one({
                    "_id": video["course_id"]
                })["instructor_id"]
            ),
            force=False
        )

        video = db.videos.find_one({
            "_id": ObjectId(video_id)
        })

        transcript = video.get("transcript")

    if not transcript:
        return

    # =========================
    # GENERATE SUMMARY
    # =========================

    summary = await gemini_service.summarize_lesson(
        transcript,
        "vi"
    )

    # =========================
    # GENERATE MINDMAP
    # =========================

    mindmap = await gemini_service.generate_mindmap(
        transcript,
        "vi"
    )

    # =========================
    # SAVE CACHE
    # =========================

    db.videos.update_one(
        {"_id": ObjectId(video_id)},
        {
            "$set": {
                "ai_cache.summary": summary,
                "ai_cache.mindmap": mindmap,
                "ai_status": "completed"
            }
        }
    )

    print("✅ AI GENERATED:", video_id)