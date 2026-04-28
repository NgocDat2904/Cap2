import os
import sys
from dotenv import load_dotenv

# 👉 Load .env (QUAN TRỌNG)
load_dotenv()

# Fix path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(ROOT_DIR)

from app.modules.ai.gemini_service import chat_about_lesson, summarize_lesson
from app.modules.ai.ai_schema import LessonContext, ChatMessage


# Test basic Gemini functionality
async def test_ai():
    # 👉 Debug xem có đọc được key chưa
    print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY"))
    print("GEMINI_MODEL:", os.getenv("GEMINI_MODEL"))

    if not os.getenv("GEMINI_API_KEY"):
        raise RuntimeError("❌ GEMINI_API_KEY chưa load được")

    context = LessonContext(
        title="Test Lesson",
        description="This is a test lesson",
        transcript="This is the transcript of the lesson. It contains information about Python programming."
    )

    messages = [
        ChatMessage(is_ai=False, text="What is Python?")
    ]

    try:
        # Test chat
        reply = await chat_about_lesson(context, messages)
        print("\n===== CHAT =====")
        print(reply)

        # Test summary
        summary = await summarize_lesson(context, "vi")
        print("\n===== SUMMARY =====")
        print(summary)

        print("\n✅ AI is working!")
    except Exception as e:
        print("\n❌ Error:", str(e))


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_ai())