import asyncio
from app.modules.course.course_service import CourseService
from app.database.mongodb import db
from bson import ObjectId

async def main():
    service = CourseService()
    # Let's just find any course that has videos
    video = db.videos.find_one({})
    if not video:
        print('No videos found')
        return
    c_id = str(video['course_id'])
    course = db.courses.find_one({'_id': video['course_id']})
    print(f'Course ID: {c_id}, Title: {course.get("title")}')
    
    videos = list(db.videos.find({'course_id': video['course_id']}))
    print(f'\nFound {len(videos)} videos in db.videos:')
    for v in videos:
        print(f' - Video title: {v.get("title")}, _id: {v["_id"]}, lesson_id: {v.get("lesson_id")}, URL: {bool(v.get("video_url") or v.get("storage_path"))}')

    print(f'\nEmbedded lessons in course:')
    for i, l in enumerate(course.get('lessons', [])):
        print(f' - {i+1}: {l.get("title")}, is_published: {l.get("is_published", True)}')

    print('\nCalling get_public_course_detail...')
    res = await service.get_public_course_detail(c_id)
    lessons = res['sections'][0]['lessons']
    print(f'Found {len(lessons)} public lessons returned by service:')
    for l in lessons:
        print(f" - Lesson: {l['title']}, play_url: {bool(l.get('play_url'))}")

asyncio.run(main())
