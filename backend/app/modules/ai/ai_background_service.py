from bson import ObjectId

from app.database.mongodb import db
from app.modules.ai.gemini_service import gemini_service
from app.modules.ai.ai_schema import (
    LessonContext
)
from app.modules.video.video_service import (
    video_service
)


async def generate_ai_for_video(
    video_id: str
):

    video = db.videos.find_one({
        "_id": ObjectId(video_id)
    })

    if not video:
        return

    # =========================================
    # GENERATE TRANSCRIPT
    # =========================================

    transcript = (
        video.get("transcript") or ""
    ).strip()

    if not transcript:

        course = db.courses.find_one({
            "_id": video["course_id"]
        })

        if not course:
            return

        await video_service.generate_transcript(
            video_id=video_id,
            instructor_id=str(
                course["instructor_id"]
            ),
            force=False
        )

        video = db.videos.find_one({
            "_id": ObjectId(video_id)
        })

        transcript = (
            video.get("transcript") or ""
        ).strip()

    if not transcript:
        return

    # =========================================
    # BUILD CONTEXT
    # =========================================

    ctx = LessonContext(

        title=video.get(
            "title",
            "Untitled"
        ),

        description=video.get(
            "description",
            ""
        ),

        transcript=transcript,
    )

    # =========================================
    # GENERATE SUMMARY
    # =========================================

    summary = (
        await gemini_service
        .summarize_lesson(
            ctx,
            "Vietnamese"
        )
    )

    # =========================================
    # GENERATE MINDMAP
    # =========================================

    mindmap = (
        await gemini_service
        .generate_mindmap_markdown(
            ctx,
            "Vietnamese"
        )
    )

    # =========================================
    # SAVE AI CACHE
    # =========================================

    db.videos.update_one(
        {
            "_id": ObjectId(video_id)
        },
        {
            "$set": {

                "ai_cache.summary":
                    summary,

                "ai_cache.mindmap":
                    mindmap,

                "ai_status":
                    "completed",
            }
        }
    )

    print(
        "✅ AI GENERATED:",
        video_id
    )