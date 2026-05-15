"""
QUICK DATABASE STATS
====================

In ra thống kê nhanh các collections để check trước/sau khi reset

Usage:
    python backend/scripts/quick_stats.py
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.mongodb import db


def print_stats():
    print("\n" + "="*60)
    print("📊 DATABASE STATISTICS")
    print("="*60 + "\n")

    # Test Data (will be reset)
    print("🗑️  TEST DATA (will be deleted by reset):")
    print(f"   Payments:        {db.payments.count_documents({}):>6}")
    print(f"   Enrollments:     {db.enrollments.count_documents({}):>6}")
    print(f"   Lesson Progress: {db.lesson_progress.count_documents({}):>6}")
    print(f"   Video Views:     {db.video_views.count_documents({}):>6}")
    print(f"   Notifications:   {db.notifications.count_documents({}):>6}")
    print(f"   Questions/QA:    {db.questions.count_documents({}):>6}")

    # Core Data (will be preserved)
    print("\n✅ CORE DATA (will be preserved):")
    print(f"   Users:           {db.users.count_documents({}):>6}")
    print(f"   Courses:         {db.courses.count_documents({}):>6}")
    print(f"   Lessons:         {db.lessons.count_documents({}):>6}")
    print(f"   Videos:          {db.videos.count_documents({}):>6}")

    # Breakdown
    print("\n📈 BREAKDOWN:")

    # Payments by status
    success = db.payments.count_documents({"status": "success"})
    pending = db.payments.count_documents({"status": "pending"})
    failed = db.payments.count_documents({"status": "failed"})
    print(f"   Payments:")
    print(f"     - Success:     {success:>6}")
    print(f"     - Pending:     {pending:>6}")
    print(f"     - Failed:      {failed:>6}")

    # Courses by status
    draft = db.courses.count_documents({"status": "DRAFT"})
    pending = db.courses.count_documents({"status": "PENDING"})
    approved = db.courses.count_documents({"status": "APPROVED"})
    rejected = db.courses.count_documents({"status": "REJECTED"})
    deleted = db.courses.count_documents({"is_deleted": True})
    archived = db.courses.count_documents({"is_archived": True})

    print(f"   Courses:")
    print(f"     - Draft:       {draft:>6}")
    print(f"     - Pending:     {pending:>6}")
    print(f"     - Approved:    {approved:>6}")
    print(f"     - Rejected:    {rejected:>6}")
    print(f"     - Deleted:     {deleted:>6}")
    print(f"     - Archived:    {archived:>6}")

    # Users by role
    admin = db.users.count_documents({"role": "admin"})
    instructor = db.users.count_documents({"role": "instructor"})
    learner = db.users.count_documents({"role": "learner"})

    print(f"   Users:")
    print(f"     - Admin:       {admin:>6}")
    print(f"     - Instructor:  {instructor:>6}")
    print(f"     - Learner:     {learner:>6}")

    # Video views total
    pipeline = [{"$group": {"_id": None, "total_views": {"$sum": "$views"}}}]
    result = list(db.videos.aggregate(pipeline))
    total_views = result[0]["total_views"] if result else 0

    print(f"\n👁️  Total video views: {total_views:,}")

    # Revenue total
    pipeline = [
        {"$match": {"status": "success"}},
        {"$group": {"_id": None, "total_revenue": {"$sum": "$amount"}}}
    ]
    result = list(db.payments.aggregate(pipeline))
    total_revenue = result[0]["total_revenue"] if result else 0

    print(f"💰 Total revenue: {total_revenue:,.0f} VND")

    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    try:
        print_stats()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n⚠️  Make sure MongoDB is running and .env is configured correctly")
