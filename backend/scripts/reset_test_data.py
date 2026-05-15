"""
SCRIPT RESET DỮ LIỆU TEST
=========================

⚠️ CHỈ DÙNG CHO MÔI TRƯỜNG TEST/DEV
⚠️ KHÔNG BAO GIỜ CHẠY TRÊN PRODUCTION

Chức năng:
- Backup toàn bộ data ra JSON
- Xóa: payments, enrollments, lesson_progress, video_views, notifications, questions
- Reset view count của videos về 0
- Giữ nguyên: users, courses, lessons, videos (nội dung khóa học)

Usage:
    python backend/scripts/reset_test_data.py
"""

import sys
import os
from datetime import datetime
import json
from pathlib import Path

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.mongodb import db
from bson import ObjectId


class TestDataResetter:

    def __init__(self):
        self.backup_dir = Path("backend/backups")
        self.backup_dir.mkdir(exist_ok=True)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.stats = {}

    def json_serializer(self, obj):
        """Custom JSON serializer cho MongoDB ObjectId và datetime"""
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    def backup_collection(self, collection_name):
        """Backup 1 collection ra file JSON"""
        print(f"📦 Backing up {collection_name}...")

        collection = db[collection_name]
        data = list(collection.find())
        count = len(data)

        if count == 0:
            print(f"   ⚠️  Collection {collection_name} is empty, skipping backup")
            return 0

        backup_file = self.backup_dir / f"{collection_name}_{self.timestamp}.json"

        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, default=self.json_serializer, indent=2, ensure_ascii=False)

        print(f"   ✅ Backed up {count} documents to {backup_file}")
        return count

    def backup_all(self):
        """Backup tất cả collections cần thiết"""
        print("\n" + "="*60)
        print("📦 PHASE 1: BACKUP DATA")
        print("="*60 + "\n")

        collections = [
            "payments",
            "enrollments",
            "lesson_progress",
            "video_views",
            "notifications",
            "questions"
        ]

        total = 0
        for coll in collections:
            count = self.backup_collection(coll)
            self.stats[f"backup_{coll}"] = count
            total += count

        print(f"\n✅ Total backed up: {total} documents")
        return total

    def reset_payments(self):
        """Xóa toàn bộ payments"""
        print("\n💳 Resetting payments...")

        result = db.payments.delete_many({})
        count = result.deleted_count
        self.stats["deleted_payments"] = count

        print(f"   ✅ Deleted {count} payment records")
        return count

    def reset_enrollments(self):
        """Xóa toàn bộ enrollments"""
        print("\n📚 Resetting enrollments...")

        result = db.enrollments.delete_many({})
        count = result.deleted_count
        self.stats["deleted_enrollments"] = count

        print(f"   ✅ Deleted {count} enrollment records")
        return count

    def reset_lesson_progress(self):
        """Xóa toàn bộ lesson progress"""
        print("\n📊 Resetting lesson progress...")

        result = db.lesson_progress.delete_many({})
        count = result.deleted_count
        self.stats["deleted_lesson_progress"] = count

        print(f"   ✅ Deleted {count} lesson progress records")
        return count

    def reset_video_views(self):
        """Xóa video_views và reset view count về 0"""
        print("\n👁️  Resetting video views...")

        # Xóa video_views collection
        result = db.video_views.delete_many({})
        count = result.deleted_count
        self.stats["deleted_video_views"] = count
        print(f"   ✅ Deleted {count} video view records")

        # Reset view count trong videos collection
        result = db.videos.update_many(
            {},
            {"$set": {"views": 0}}
        )
        updated = result.modified_count
        self.stats["reset_video_view_count"] = updated
        print(f"   ✅ Reset view count for {updated} videos")

        return count

    def reset_notifications(self):
        """Xóa notifications liên quan đến payment, enrollment"""
        print("\n🔔 Resetting notifications...")

        # Xóa notifications có type liên quan đến test data
        result = db.notifications.delete_many({
            "type": {
                "$in": [
                    "payment_success",
                    "payment_failed",
                    "new_enroll",
                    "qa",
                    "question_reply"
                ]
            }
        })
        count = result.deleted_count
        self.stats["deleted_notifications"] = count

        print(f"   ✅ Deleted {count} notification records")
        return count

    def reset_questions(self):
        """Xóa toàn bộ questions & replies"""
        print("\n💬 Resetting Q&A questions...")

        result = db.questions.delete_many({})
        count = result.deleted_count
        self.stats["deleted_questions"] = count

        print(f"   ✅ Deleted {count} question/reply records")
        return count

    def print_summary(self):
        """In báo cáo tổng kết"""
        print("\n" + "="*60)
        print("📊 RESET SUMMARY")
        print("="*60 + "\n")

        print("📦 BACKUP:")
        print(f"   - Payments:        {self.stats.get('backup_payments', 0):>6} documents")
        print(f"   - Enrollments:     {self.stats.get('backup_enrollments', 0):>6} documents")
        print(f"   - Lesson Progress: {self.stats.get('backup_lesson_progress', 0):>6} documents")
        print(f"   - Video Views:     {self.stats.get('backup_video_views', 0):>6} documents")
        print(f"   - Notifications:   {self.stats.get('backup_notifications', 0):>6} documents")
        print(f"   - Questions:       {self.stats.get('backup_questions', 0):>6} documents")

        print("\n🗑️  DELETED:")
        print(f"   - Payments:        {self.stats.get('deleted_payments', 0):>6} records")
        print(f"   - Enrollments:     {self.stats.get('deleted_enrollments', 0):>6} records")
        print(f"   - Lesson Progress: {self.stats.get('deleted_lesson_progress', 0):>6} records")
        print(f"   - Video Views:     {self.stats.get('deleted_video_views', 0):>6} records")
        print(f"   - Notifications:   {self.stats.get('deleted_notifications', 0):>6} records")
        print(f"   - Questions:       {self.stats.get('deleted_questions', 0):>6} records")

        print(f"\n🔄 RESET:")
        print(f"   - Video view count: {self.stats.get('reset_video_view_count', 0):>6} videos")

        print("\n✅ PRESERVED (không thay đổi):")
        users_count = db.users.count_documents({})
        courses_count = db.courses.count_documents({})
        lessons_count = db.lessons.count_documents({})
        videos_count = db.videos.count_documents({})

        print(f"   - Users:           {users_count:>6} users")
        print(f"   - Courses:         {courses_count:>6} courses")
        print(f"   - Lessons:         {lessons_count:>6} lessons")
        print(f"   - Videos:          {videos_count:>6} videos")

        print(f"\n📁 Backup location: {self.backup_dir.absolute()}")
        print("="*60 + "\n")

    def run(self):
        """Chạy toàn bộ process reset"""
        print("\n" + "🚨"*30)
        print("⚠️  WARNING: TEST DATA RESET SCRIPT")
        print("🚨"*30)
        print("\nScript này sẽ XÓA:")
        print("  - Tất cả payments (lịch sử thanh toán)")
        print("  - Tất cả enrollments (đăng ký khóa học)")
        print("  - Tất cả lesson_progress (tiến độ học)")
        print("  - Tất cả video_views (lượt xem video)")
        print("  - Tất cả notifications (thông báo liên quan)")
        print("  - Tất cả questions/replies (Q&A)")
        print("\nScript này SẼ GIỮ NGUYÊN:")
        print("  - Users (tài khoản)")
        print("  - Courses (khóa học)")
        print("  - Lessons & Videos (nội dung)")

        print("\n" + "⚠️ "*20)
        confirm = input("\nGõ 'YES' (viết hoa) để xác nhận: ")

        if confirm != "YES":
            print("\n❌ Cancelled. Không có gì bị xóa.")
            return

        print("\n🚀 Starting reset process...\n")

        try:
            # Phase 1: Backup
            self.backup_all()

            # Phase 2: Delete
            print("\n" + "="*60)
            print("🗑️  PHASE 2: DELETE DATA")
            print("="*60)

            self.reset_payments()
            self.reset_enrollments()
            self.reset_lesson_progress()
            self.reset_video_views()
            self.reset_notifications()
            self.reset_questions()

            # Phase 3: Summary
            self.print_summary()

            print("✅ Reset completed successfully!")
            print("\n💡 TIP: Để restore lại data, dùng:")
            print(f"    mongoimport --db <database> --collection <collection> --file <backup_file>")

        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            print("⚠️  Reset bị gián đoạn. Kiểm tra lại database!")
            raise


if __name__ == "__main__":
    resetter = TestDataResetter()
    resetter.run()
