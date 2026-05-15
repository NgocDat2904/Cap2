"""
DEBUG Q&A TRONG INSTRUCTOR DASHBOARD
=====================================

Script để debug lỗi Q&A không hiển thị

Usage:
    python backend/scripts/debug_qa_dashboard.py <instructor_id>
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.mongodb import db
from bson import ObjectId
from app.modules.user.user_repository import get_user_by_id


def debug_qa(instructor_id):
    print("\n" + "="*60)
    print("🔍 DEBUG Q&A DASHBOARD")
    print("="*60 + "\n")

    print(f"Instructor ID: {instructor_id}\n")

    # 1. Check instructor tồn tại
    instructor = db.users.find_one({"_id": ObjectId(instructor_id)})
    if not instructor:
        print("❌ Instructor không tồn tại!")
        return

    print(f"✅ Instructor: {instructor.get('fullName')} ({instructor.get('email')})")
    print(f"   Role: {instructor.get('role')}\n")

    # 2. Check active courses
    active_courses = list(db.courses.find({
        "instructor_id": ObjectId(instructor_id),
        "status": "APPROVED",
        "is_deleted": {"$ne": True},
        "is_archived": {"$ne": True}
    }))

    print(f"📚 Active Courses: {len(active_courses)}")

    if not active_courses:
        print("   ⚠️  Instructor KHÔNG CÓ khóa học APPROVED nào!")
        print("   → Không thể lấy Q&A vì không có course_id để query\n")
        return

    for c in active_courses:
        print(f"   - {c.get('title')} (ID: {c['_id']})")

    course_ids = [c["_id"] for c in active_courses]
    print(f"\n   Course IDs: {course_ids}\n")

    # 3. Check total questions
    total_questions = db.questions.count_documents({
        "course_id": {"$in": course_ids}
    })

    print(f"💬 Total Questions: {total_questions}")

    if total_questions == 0:
        print("   ⚠️  Không có câu hỏi nào trong các khóa học này!\n")
        return

    # 4. Check questions by type
    questions_only = db.questions.count_documents({
        "course_id": {"$in": course_ids},
        "type": "question"
    })

    replies_only = db.questions.count_documents({
        "course_id": {"$in": course_ids},
        "type": "reply"
    })

    print(f"   - Questions: {questions_only}")
    print(f"   - Replies: {replies_only}\n")

    # 5. Latest 3 questions
    print("📋 Latest 3 Questions:\n")

    latest_questions = list(
        db.questions.find({
            "course_id": {"$in": course_ids},
            "type": "question"
        })
        .sort("created_at", -1)
        .limit(3)
    )

    if not latest_questions:
        print("   ⚠️  Query trả về 0 questions!\n")
        return

    print(f"   Query returned: {len(latest_questions)} questions\n")

    for i, q in enumerate(latest_questions, 1):
        print(f"   {i}. Question ID: {q['_id']}")
        print(f"      Created: {q.get('created_at')}")
        print(f"      Course ID: {q.get('course_id')}")
        print(f"      User ID: {q.get('user_id')}")
        print(f"      Type: {q.get('type')}")

        content = q.get("content")
        if not content or not content.strip():
            print(f"      Content: ⚠️  EMPTY/NULL (will be skipped!)")
        else:
            print(f"      Content: {content[:50]}...")

        # Check learner
        learner = get_user_by_id(str(q.get("user_id")))
        if learner:
            print(f"      Learner: {learner.get('fullName')} ({learner.get('email')})")
        else:
            print(f"      Learner: ⚠️  User không tồn tại!")

        # Check course
        course = db.courses.find_one({"_id": q.get("course_id")})
        if course:
            print(f"      Course: {course.get('title')}")
        else:
            print(f"      Course: ⚠️  Course không tồn tại!")

        print()

    # 6. Simulate dashboard logic
    print("="*60)
    print("🎯 DASHBOARD LOGIC SIMULATION")
    print("="*60 + "\n")

    latest_qa = []

    for q in latest_questions:
        content = q.get("content")
        if not content or not content.strip():
            print(f"⏭️  Skip question {q['_id']} - Content empty")
            continue

        learner = get_user_by_id(str(q.get("user_id")))
        course = db.courses.find_one({"_id": q.get("course_id")})

        created_at = q.get("created_at")
        date_str = ""
        if created_at:
            try:
                if hasattr(created_at, 'isoformat'):
                    date_str = created_at.isoformat() + "Z"
                else:
                    date_str = str(created_at)
            except:
                date_str = str(created_at)

        latest_qa.append({
            "id": str(q["_id"]),
            "question": content.strip(),
            "course": course.get("title") if course else "Khóa học chưa xác định",
            "name": learner.get("fullName") if learner else "Học viên ẩn danh",
            "date": date_str,
            "avatar": learner.get("avatar_url") if learner else None
        })

        print(f"✅ Added question {q['_id']}")

    print(f"\n📊 RESULT: {len(latest_qa)} Q&A items will be returned to frontend\n")

    if len(latest_qa) == 0:
        print("❌ BUG CONFIRMED: Dashboard sẽ hiển thị 0 Q&A!\n")
        print("🔍 POSSIBLE CAUSES:")
        print("   - Tất cả questions đều có content empty/null")
        print("   - Questions bị filter do lỗi logic\n")
    elif len(latest_qa) < 3 and len(latest_questions) == 3:
        print(f"⚠️  WARNING: Query lấy {len(latest_questions)} questions nhưng chỉ return {len(latest_qa)}")
        print(f"   → Một số questions bị skip do content empty\n")
    else:
        print("✅ OK: Dashboard sẽ hiển thị đầy đủ Q&A\n")

    print("="*60)

    # Print final result
    import json
    print("\n📄 Final JSON Output:\n")
    print(json.dumps(latest_qa, indent=2, default=str, ensure_ascii=False))
    print()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_qa_dashboard.py <instructor_id>")
        print("\nExample:")
        print("  python backend/scripts/debug_qa_dashboard.py 507f1f77bcf86cd799439011")
        sys.exit(1)

    instructor_id = sys.argv[1]

    try:
        debug_qa(instructor_id)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
