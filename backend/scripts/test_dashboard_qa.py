"""
TEST INSTRUCTOR DASHBOARD Q&A
==============================

Script để test Q&A card sau khi fix

Usage:
    python backend/scripts/test_dashboard_qa.py
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.mongodb import db
from bson import ObjectId
import asyncio


async def test_dashboard_qa():
    print("\n" + "="*60)
    print("🧪 TEST INSTRUCTOR DASHBOARD Q&A")
    print("="*60 + "\n")

    # 1. Find instructor có khóa học
    instructors = list(db.users.find({"role": "instructor"}).limit(5))

    if not instructors:
        print("❌ Không có instructor nào trong DB!")
        return

    print(f"📋 Found {len(instructors)} instructors\n")

    for instructor in instructors:
        instructor_id = str(instructor["_id"])
        instructor_name = instructor.get("fullName", instructor.get("email"))

        print(f"\n{'='*60}")
        print(f"👤 Testing: {instructor_name}")
        print(f"   ID: {instructor_id}")
        print(f"{'='*60}\n")

        # Count courses
        course_count = db.courses.count_documents({
            "instructor_id": instructor["_id"],
            "status": "APPROVED",
            "is_deleted": {"$ne": True},
            "is_archived": {"$ne": True}
        })

        print(f"📚 Active Courses: {course_count}")

        if course_count == 0:
            print("   ⏭️  Skip - No active courses\n")
            continue

        # Get course_ids
        active_courses = list(db.courses.find({
            "instructor_id": instructor["_id"],
            "status": "APPROVED",
            "is_deleted": {"$ne": True},
            "is_archived": {"$ne": True}
        }))

        course_ids = [c["_id"] for c in active_courses]

        # Count questions
        total_questions = db.questions.count_documents({
            "course_id": {"$in": course_ids},
            "type": "question"
        })

        valid_questions = db.questions.count_documents({
            "course_id": {"$in": course_ids},
            "type": "question",
            "content": {"$exists": True, "$ne": "", "$ne": None}
        })

        print(f"💬 Questions:")
        print(f"   - Total: {total_questions}")
        print(f"   - Valid (có content): {valid_questions}")

        if valid_questions == 0:
            print("   ⏭️  Skip - No valid questions\n")
            continue

        # Test dashboard service
        from app.modules.dashboard.dashboard_service import dashboard_service

        try:
            result = await dashboard_service.get_instructor_dashboard(instructor_id)

            latest_qa = result.get("latest_qa", [])

            print(f"\n📊 Dashboard Result:")
            print(f"   - Q&A returned: {len(latest_qa)}")

            if len(latest_qa) == 0:
                print("   ❌ BUG: Dashboard trả về 0 Q&A dù có questions!")
            elif len(latest_qa) < 3 and valid_questions >= 3:
                print(f"   ⚠️  WARNING: Có {valid_questions} questions nhưng chỉ return {len(latest_qa)}")
            else:
                print(f"   ✅ OK")

            # Print Q&A details
            if latest_qa:
                print(f"\n   Q&A Items:")
                for i, qa in enumerate(latest_qa, 1):
                    print(f"      {i}. {qa.get('name')}: {qa.get('question')[:50]}...")
                    print(f"         Course: {qa.get('course')}")
                    print(f"         Date: {qa.get('date')}")

        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "="*60)
    print("✅ Test completed")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(test_dashboard_qa())
