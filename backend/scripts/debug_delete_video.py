"""
DEBUG DELETE VIDEO ISSUE
=========================

Script để kiểm tra tại sao xóa video trên web nhưng database không mất

Usage:
    python backend/scripts/debug_delete_video.py <video_id>
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database.mongodb import db
from bson import ObjectId


def debug_video_delete(video_id):
    print("\n" + "="*60)
    print("🔍 DEBUG DELETE VIDEO ISSUE")
    print("="*60 + "\n")

    print(f"Video ID: {video_id}\n")

    # 1. Check video tồn tại trong database
    try:
        video = db.videos.find_one({"_id": ObjectId(video_id)})
    except Exception as e:
        print(f"❌ Invalid ObjectId: {e}")
        print("⚠️  Video ID không đúng format MongoDB ObjectId (24 hex chars)")
        return

    if not video:
        print("❌ Video KHÔNG TỒN TẠI trong database!")
        print("   → Video đã bị xóa thành công")
        print()
        return

    print("✅ Video VẪN CÒN trong database!")
    print(f"   → Điều này xác nhận video CHƯA BỊ XÓA\n")

    # 2. In thông tin video
    print("📹 Video Details:")
    print(f"   - ID: {video['_id']}")
    print(f"   - Title: {video.get('title', 'N/A')}")
    print(f"   - Course ID: {video.get('course_id')}")
    print(f"   - Lesson ID: {video.get('lesson_id')}")
    print(f"   - Created: {video.get('created_at')}")
    print(f"   - Video URL: {video.get('video_url', 'N/A')[:50]}...")
    print()

    # 3. Check course
    course_id = video.get("course_id")
    if course_id:
        course = db.courses.find_one({"_id": course_id})
        if course:
            print("📚 Course Details:")
            print(f"   - ID: {course['_id']}")
            print(f"   - Title: {course.get('title')}")
            print(f"   - Instructor ID: {course.get('instructor_id')}")
            print(f"   - Status: {course.get('status')}")
        else:
            print("⚠️  Course không tồn tại (video orphan)")
        print()

    # 4. Check có bao nhiêu videos khác trong course này
    if course_id:
        total_videos = db.videos.count_documents({"course_id": course_id})
        print(f"📊 Total videos in course: {total_videos}")
        print()

    # 5. Kiểm tra endpoint có tồn tại không
    print("="*60)
    print("🔍 CHECKING API ENDPOINT")
    print("="*60 + "\n")

    # Import để check
    try:
        from app.modules.video.video_controller import router
        routes = [route for route in router.routes]

        delete_routes = [r for r in routes if hasattr(r, 'methods') and 'DELETE' in r.methods]

        if delete_routes:
            print("✅ DELETE endpoints found:")
            for route in delete_routes:
                print(f"   - {route.path} ({route.methods})")
        else:
            print("❌ KHÔNG CÓ DELETE endpoint trong video_controller!")
            print("   → Đây có thể là nguyên nhân!")
        print()

    except Exception as e:
        print(f"⚠️  Cannot check routes: {e}\n")

    # 6. Thử xóa thủ công
    print("="*60)
    print("🧪 MANUAL DELETE TEST")
    print("="*60 + "\n")

    confirm = input("Bạn có muốn thử XÓA THỰC SỰ video này không? (yes/no): ").strip().lower()

    if confirm == "yes":
        try:
            # Xóa video
            result = db.videos.delete_one({"_id": ObjectId(video_id)})

            if result.deleted_count > 0:
                print(f"✅ Video đã bị xóa thành công từ database!")
                print(f"   Deleted count: {result.deleted_count}")

                # Xóa related data
                views_deleted = db.video_views.delete_many({"video_id": ObjectId(video_id)})
                print(f"   Video views deleted: {views_deleted.deleted_count}")

                summaries_deleted = db.ai_summaries.delete_many({"video_id": ObjectId(video_id)})
                print(f"   AI summaries deleted: {summaries_deleted.deleted_count}")

                mindmaps_deleted = db.ai_mindmaps.delete_many({"video_id": ObjectId(video_id)})
                print(f"   AI mindmaps deleted: {mindmaps_deleted.deleted_count}")

            else:
                print(f"❌ Không thể xóa video!")
                print(f"   Có thể video đã bị xóa hoặc ID không đúng")

        except Exception as e:
            print(f"❌ Lỗi khi xóa: {e}")
    else:
        print("⏭️  Bỏ qua manual delete test")

    print("\n" + "="*60)
    print("💡 POSSIBLE CAUSES")
    print("="*60 + "\n")

    print("1. ❌ Backend DELETE endpoint KHÔNG TỒN TẠI")
    print("   → Frontend gọi API nhưng endpoint 404")
    print("   → Check: backend/app/modules/video/video_controller.py")
    print()

    print("2. ❌ Frontend GỌI SAI endpoint")
    print("   → Gọi /lessons/{id} thay vì /videos/{id}")
    print("   → Check: FE_EduSync/src/services/adminCourseAPI.js")
    print()

    print("3. ❌ Backend route CHƯA ĐƯỢC REGISTER")
    print("   → Endpoint có nhưng không được include vào app")
    print("   → Check: backend/app/main.py")
    print()

    print("4. ❌ Permission check FAILED")
    print("   → Admin/Instructor không có quyền xóa")
    print("   → Backend return 403 nhưng frontend không handle")
    print()

    print("5. ❌ Database operation KHÔNG EXECUTE")
    print("   → Code có nhưng có exception bị bắt")
    print("   → Check backend logs")
    print()

    print("="*60 + "\n")


def check_all_videos_in_course(course_id):
    """List tất cả videos trong 1 course"""
    print("\n" + "="*60)
    print(f"📹 ALL VIDEOS IN COURSE: {course_id}")
    print("="*60 + "\n")

    try:
        videos = list(db.videos.find({"course_id": ObjectId(course_id)}))

        if not videos:
            print("⚠️  Không có video nào trong course này!")
            return

        print(f"Total: {len(videos)} videos\n")

        for i, video in enumerate(videos, 1):
            print(f"{i}. Video ID: {video['_id']}")
            print(f"   Title: {video.get('title', 'N/A')}")
            print(f"   Duration: {video.get('duration', 'N/A')}")
            print(f"   Views: {video.get('views', 0)}")
            print()

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_delete_video.py <video_id>")
        print("\nExample:")
        print("  python backend/scripts/debug_delete_video.py 6a0554c4f984db573959ec12")
        print("\nOr check all videos in a course:")
        print("  python backend/scripts/debug_delete_video.py --course <course_id>")
        sys.exit(1)

    if sys.argv[1] == "--course" and len(sys.argv) >= 3:
        check_all_videos_in_course(sys.argv[2])
    else:
        video_id = sys.argv[1]
        debug_video_delete(video_id)
