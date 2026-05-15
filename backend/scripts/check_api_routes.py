"""
CHECK API ROUTES
================

Script để kiểm tra tất cả API routes đã được register

Usage:
    python backend/scripts/check_api_routes.py
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app


def check_routes():
    print("\n" + "="*80)
    print("📋 CHECKING ALL API ROUTES")
    print("="*80 + "\n")

    # Get all routes
    routes = []
    for route in app.routes:
        if hasattr(route, 'methods') and hasattr(route, 'path'):
            for method in route.methods:
                if method != "HEAD":  # Skip HEAD method
                    routes.append({
                        'method': method,
                        'path': route.path,
                        'name': route.name
                    })

    # Sort by path
    routes.sort(key=lambda x: (x['path'], x['method']))

    # Group by module
    video_routes = [r for r in routes if 'video' in r['path']]
    lesson_routes = [r for r in routes if 'lesson' in r['path']]
    course_routes = [r for r in routes if 'course' in r['path']]

    # Print video routes
    print("📹 VIDEO ROUTES:")
    if video_routes:
        for route in video_routes:
            icon = "🔴" if route['method'] == "DELETE" else "🟢" if route['method'] == "POST" else "🔵" if route['method'] == "GET" else "🟡"
            print(f"   {icon} {route['method']:<7} {route['path']}")
    else:
        print("   ⚠️  No video routes found!")
    print()

    # Check DELETE video endpoint specifically
    delete_video_routes = [r for r in video_routes if r['method'] == 'DELETE']

    if delete_video_routes:
        print("✅ DELETE video endpoint(s) found:")
        for route in delete_video_routes:
            print(f"   - {route['path']}")
    else:
        print("❌ KHÔNG CÓ DELETE video endpoint!")
        print("   → Đây là nguyên nhân video không bị xóa khỏi database!")
    print()

    # Print lesson routes
    print("📚 LESSON ROUTES:")
    if lesson_routes:
        for route in lesson_routes:
            icon = "🔴" if route['method'] == "DELETE" else "🟢" if route['method'] == "POST" else "🔵" if route['method'] == "GET" else "🟡"
            print(f"   {icon} {route['method']:<7} {route['path']}")
    else:
        print("   ⚠️  No lesson routes found!")
    print()

    # Check DELETE lesson endpoint
    delete_lesson_routes = [r for r in lesson_routes if r['method'] == 'DELETE']

    if delete_lesson_routes:
        print("✅ DELETE lesson endpoint(s) found:")
        for route in delete_lesson_routes:
            print(f"   - {route['path']}")
    else:
        print("⚠️  No DELETE lesson endpoint found")
    print()

    # Print course routes (only admin/instructor)
    admin_course_routes = [r for r in course_routes if 'admin' in r['path'] or 'instructor' in r['path']]
    print("📚 COURSE ROUTES (Admin/Instructor):")
    for route in admin_course_routes[:10]:  # Limit to first 10
        icon = "🔴" if route['method'] == "DELETE" else "🟢" if route['method'] == "POST" else "🔵" if route['method'] == "GET" else "🟡"
        print(f"   {icon} {route['method']:<7} {route['path']}")
    if len(admin_course_routes) > 10:
        print(f"   ... and {len(admin_course_routes) - 10} more")
    print()

    # Summary
    print("="*80)
    print("📊 SUMMARY")
    print("="*80 + "\n")

    print(f"Total routes: {len(routes)}")
    print(f"Video routes: {len(video_routes)}")
    print(f"Lesson routes: {len(lesson_routes)}")
    print(f"Course routes: {len(course_routes)}")
    print()

    # Check specific endpoints needed
    print("🔍 CHECKING REQUIRED ENDPOINTS:\n")

    endpoints_check = [
        ("DELETE /instructor/videos/{video_id}", any(r['method'] == 'DELETE' and 'videos' in r['path'] and 'instructor' in r['path'] for r in routes)),
        ("DELETE /instructor/lessons/{lesson_id}", any(r['method'] == 'DELETE' and 'lessons' in r['path'] and 'instructor' in r['path'] for r in routes)),
        ("POST /instructor/videos", any(r['method'] == 'POST' and 'videos' in r['path'] and 'instructor' in r['path'] for r in routes)),
        ("POST /instructor/lessons", any(r['method'] == 'POST' and 'lessons' in r['path'] and 'instructor' in r['path'] for r in routes)),
    ]

    for endpoint, exists in endpoints_check:
        if exists:
            print(f"   ✅ {endpoint}")
        else:
            print(f"   ❌ {endpoint} - MISSING!")

    print()

    # Final diagnosis
    if not any(r['method'] == 'DELETE' and 'videos' in r['path'] for r in routes):
        print("="*80)
        print("🔥 DIAGNOSIS: DELETE VIDEO ENDPOINT MISSING!")
        print("="*80 + "\n")
        print("Nguyên nhân video không bị xóa:")
        print("1. Backend KHÔNG CÓ endpoint DELETE /instructor/videos/{id}")
        print("2. Frontend gọi API → 404 Not Found")
        print("3. Video vẫn còn trong database")
        print()
        print("Giải pháp:")
        print("1. Thêm endpoint DELETE trong backend/app/modules/video/video_controller.py")
        print("2. Register route trong backend/app/main.py")
        print("3. Restart backend server")
        print()


if __name__ == "__main__":
    try:
        check_routes()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
