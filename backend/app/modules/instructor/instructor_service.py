from fastapi import HTTPException
from bson import ObjectId
from app.database.mongodb import db
from datetime import datetime   # ✅ THÊM

# instructor
from .instructor_repository import *
from .instructor_model import instructor_profile_model

# user
from app.modules.user.user_repository import get_user_by_id, update_user

# upload
from app.utils.cloudinary import upload_image
from app.modules.course.course_repository import CourseRepository
# course
from app.modules.course.course_repository import CourseRepository


class InstructorService:

    def __init__(self):
        self.course_repo = CourseRepository()

    # =========================
    # 🔍 GET INSTRUCTOR PROFILE
    # =========================
    def get_instructor_profile(self, user_id: str):
        profile = get_by_user_id(user_id)
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            **instructor_profile_model(profile),

            "fullName": user.get("fullName", ""),
            "email": user.get("email", ""),
            "phone": str(user.get("phone", "")),
            "gender": user.get("gender", ""),
            "dob": user.get("dob", ""),
            "address": user.get("address", ""),
            "avatarUrl": user.get("avatar_url", ""),

            "linkedin": profile.get("linkedin_url", ""),
            "github": profile.get("github_url", ""),
            "youtube": profile.get("youtube_url", ""),
            "website": profile.get("website_url", ""),

            "totalStudents": profile.get("totalStudents", 0),
            "totalCourses": profile.get("totalCourses", 0),
            "isVerified": profile.get("isVerified", True),
        }

    # =========================
    # 🔄 UPDATE PROFILE
    # =========================
    def update_instructor_profile(self, user_id: str, data):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        data_dict = {
            k: v for k, v in data.dict(exclude_unset=True).items()
            if v is not None
        }

        user_fields_map = {
            "fullName": "fullName",
            "email": "email",
            "phone": "phone",
            "gender": "gender",
            "dob": "dob",
            "address": "address",
            "avatarUrl": "avatar_url"
        }

        user_update = {}
        for key, db_key in user_fields_map.items():
            if key in data_dict:
                user_update[db_key] = data_dict[key]

        if user_update:
            update_user(user_id, user_update)

        instructor_fields_map = {
            "headline": "headline",
            "bio": "bio",
            "specializations": "specializations",
            "linkedin": "linkedin_url",
            "github": "github_url",
            "youtube": "youtube_url",
            "website": "website_url",
        }

        instructor_update = {}
        for key, db_key in instructor_fields_map.items():
            if key in data_dict:
                instructor_update[db_key] = data_dict[key]

        if instructor_update:
            update_profile(user_id, instructor_update)

        return self.get_instructor_profile(user_id)

    # =========================
    # 🖼️ UPLOAD AVATAR
    # =========================
    def upload_avatar(self, user_id: str, file):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        image_url = upload_image(file.file)

        update_user(user_id, {"avatar_url": image_url})

        return {
            "message": "Upload avatar thành công",
            "avatarUrl": image_url
        }

    # =========================
    # 📊 GET STUDENTS (FINAL)
    # =========================
    async def get_students(self, instructor_id: str, search=None, course_id=None):
        result = []

        if course_id:
            course = await self.course_repo.get_by_id(course_id)
            courses = [course] if course else []
        else:
            courses = await self.course_repo.find_by_instructor(instructor_id)

        total_students = 0
        active_students = 0
        total_progress = 0

        for course in courses:
            if not course:
                continue

            c_id = course.get("id")

            enrollments = list(db.enrollments.find({
                "course_id": ObjectId(c_id)
            }))

            for enroll in enrollments:
                user_id = enroll.get("learner_id")
                if not user_id:
                    continue

                user = get_user_by_id(str(user_id))
                if not user:
                    continue

                # 🔍 search
                if search:
                    keyword = search.lower()
                    if keyword not in user.get("fullName", "").lower() and \
                       keyword not in user.get("email", "").lower():
                        continue

                progress = enroll.get("progress_percent", 0)

                # 🔥 LAST ACTIVITY (NEW)
                last_time = enroll.get("last_accessed_at")

                if last_time:
                    diff = datetime.utcnow() - last_time
                    hours = int(diff.total_seconds() // 3600)

                    if hours < 1:
                        last_activity = "Vừa xong"
                    elif hours < 24:
                        last_activity = f"{hours} giờ trước"
                    else:
                        last_activity = f"{hours // 24} ngày trước"
                else:
                    last_activity = "Chưa học"

                total_students += 1
                total_progress += progress

                if progress > 0:
                    active_students += 1

                result.append({
                    "studentName": user.get("fullName"),
                    "email": user.get("email"),
                    "avatar": user.get("avatar_url"),
                    "courseName": course.get("title"),
                    "progress": progress,
                    "progressLabel": f"{progress}%",
                    "enrolledAt": last_time.strftime("%d/%m/%Y") if last_time else "",
                    "lastActivity": last_activity   # ✅ THÊM
                })

        avg_progress = int(total_progress / total_students) if total_students else 0

        return {
            "stats": {
                "totalStudents": total_students,
                "activeStudents": active_students,
                "avgProgress": avg_progress
            },
            "students": result
        }


# singleton
instructor_service = InstructorService()