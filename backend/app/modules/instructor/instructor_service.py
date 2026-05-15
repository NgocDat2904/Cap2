from re import search
from urllib import response

from fastapi import HTTPException
from bson import ObjectId
from app.database.mongodb import db
from datetime import datetime, timedelta  # ✅ THÊM

# instructor
from .instructor_repository import *
from .instructor_model import instructor_profile_model

# user
from app.modules.user.user_repository import get_user_by_id, update_user

# upload
from app.utils.cloudinary import upload_image
from app.modules.course.course_repository import CourseRepository
# course



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

        # ====================================
        # TÍNH TOÁN THỰC TẾ TOTAL COURSES
        # ====================================
        total_courses = db.courses.count_documents({
            "instructor_id": ObjectId(user_id),
            "status": "APPROVED",  # Chỉ đếm khóa học đã được duyệt
            "is_deleted": {"$ne": True},
            "is_archived": {"$ne": True}
        })

        # ====================================
        # TÍNH TOÁN THỰC TẾ TOTAL STUDENTS
        # ====================================
        # Lấy tất cả course_ids của instructor
        courses = list(db.courses.find({
            "instructor_id": ObjectId(user_id),
            "status": "APPROVED",
            "is_deleted": {"$ne": True}
        }, {"_id": 1}))

        course_ids = [course["_id"] for course in courses]

        # Đếm số học viên UNIQUE đã đăng ký các khóa học
        total_students = 0
        if course_ids:
            enrollments = list(db.enrollments.find({
                "course_id": {"$in": course_ids}
            }, {"user_id": 1}))

            # Lấy danh sách user_id unique
            unique_students = set([str(e["user_id"]) for e in enrollments])
            total_students = len(unique_students)

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

            "totalStudents": total_students,  # Tính toán thực tế
            "totalCourses": total_courses,     # Tính toán thực tế
            "isVerified": profile.get("isVerified", True),
        }

    # =========================
    # 🔄 UPDATE PROFILE
    # =========================
    def update_instructor_profile(self, user_id: str, data):
        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Handle both plain dict (from /update-full-profile) and Pydantic model (from /update-profile)
        if isinstance(data, dict):
            data_dict = {k: v for k, v in data.items() if v is not None}
        else:
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
    # =========================
# 📊 GET STUDENTS (FINAL)
# =========================
    def format_last_active(self, dt):

        if not dt:
            return "Never"

        now = datetime.utcnow()

        diff = now - dt

        seconds = diff.total_seconds()

        # ====================================
        # MINUTES
        # ====================================

        minutes = int(seconds // 60)

        if minutes < 60:
            return f"{minutes} phút trước"

        # ====================================
        # HOURS
        # ====================================

        hours = int(minutes // 60)

        if hours < 24:
            return f"{hours} giờ trước"

        # ====================================
        # DAYS
        # ====================================

        days = int(hours // 24)

        if days < 30:
            return f"{days} ngày trước"

        # ====================================
        # MONTHS
        # ====================================

        months = int(days // 30)

        if months < 12:
            return f"{months} tháng trước"

        # ====================================
        # YEARS
        # ====================================

        years = int(months // 12)

        return f"{years} năm trước"


    def get_students(
        self,
        instructor_id: str,
        search: str = None,
        course_id: str = None
    ):

        # =========================================
        # 1. QUERY COURSES
        # =========================================

        course_filter = {
            "instructor_id": ObjectId(instructor_id),
            "status": "APPROVED",
            "is_deleted": {"$ne": True},
            "is_archived": {"$ne": True}
        }

        print("INSTRUCTOR ID:", instructor_id)

        # filter theo course nếu có
        if course_id:
            course_filter["_id"] = ObjectId(course_id)

        courses = list(
            db.courses.find(course_filter)
        )

        print("COURSES:", courses)

        # =========================================
        # NO COURSES
        # =========================================

        if not courses:

            return {
                "stats": {
                    "total_students": 0,
                    "active_learners": 0,
                    "avg_completion_rate": 0
                },
                "students": []
            }

        # =========================================
        # 2. COURSE IDS
        # =========================================

        course_ids = [
            course["_id"]
            for course in courses
        ]

        print("COURSE IDS:", course_ids)

        # =========================================
        # 3. QUERY ENROLLMENTS
        # =========================================

        enrollments = list(
            db.enrollments.find({
                "course_id": {
                    "$in": course_ids
                }
            })
        )

        print("ENROLLMENTS:", enrollments)

        # =========================================
        # NO ENROLLMENTS
        # =========================================

        if not enrollments:

            return {
                "stats": {
                    "total_students": 0,
                    "active_learners": 0,
                    "avg_completion_rate": 0
                },
                "students": []
            }

        # =========================================
        # 4. LEARNER IDS
        # =========================================

        learner_ids = list(set([

            enrollment["user_id"]

            for enrollment in enrollments
        ]))

        print("LEARNER IDS:", learner_ids)

        # =========================================
        # 5. USER FILTER
        # =========================================

        user_filter = {
            "_id": {
                "$in": learner_ids
            }
        }

        # =========================================
        # SEARCH
        # =========================================

        if search:

            user_filter["$or"] = [

                {
                    "fullName": {
                        "$regex": search,
                        "$options": "i"
                    }
                },

                {
                    "email": {
                        "$regex": search,
                        "$options": "i"
                    }
                }
            ]

        students = list(
            db.users.find(user_filter)
        )

        print("STUDENTS:", students)

        # =========================================
        # 6. BUILD RESPONSE
        # =========================================

        response = []

        for enrollment in enrollments:

            # ====================================
            # FIND STUDENT
            # ====================================

            student = next(
                (
                    s for s in students
                    if s["_id"] == enrollment["user_id"]
                ),
                None
            )

            if not student:
                continue

            # ====================================
            # FIND COURSE
            # ====================================

            course = next(
                (
                    c for c in courses
                    if c["_id"] == enrollment["course_id"]
                ),
                None
            )

            # ====================================
            # CALCULATE PROGRESS
            # ====================================

            progress = self.calculate_course_progress(

                user_id=enrollment["user_id"],

                course_id=enrollment["course_id"]
            )

            # ====================================
            # LESSON SUMMARY
            # ====================================

            total_lessons = db.lessons.count_documents({
                "course_id": enrollment["course_id"]
            })

            completed_lessons = db.lesson_progress.count_documents({

                "user_id": enrollment["user_id"],

                "is_completed": True,

                "lesson_id": {
                    "$exists": True
                }
            })

            # ====================================
            # RESPONSE ITEM
            # ====================================

            # Xác định trạng thái dựa trên hoạt động thực tế
            if student.get("is_blocked", False):
                user_status = "blocked"
            else:
                # Kiểm tra hoạt động dựa trên last_accessed_at
                last_accessed = enrollment.get("last_accessed_at")
                if not last_accessed:
                    user_status = "inactive"  # Chưa bao giờ học
                else:
                    # Tính thời gian từ lần cuối truy cập
                    days_since_active = (datetime.utcnow() - last_accessed).days

                    if days_since_active <= 7:
                        user_status = "active"  # Hoạt động trong 7 ngày
                    elif days_since_active <= 30:
                        user_status = "idle"  # Không hoạt động 7-30 ngày
                    else:
                        user_status = "inactive"  # Không hoạt động > 30 ngày

            response.append({

                "student_id": str(student["_id"]),

                "name": student.get("fullName"),

                "email": student.get("email"),

                "avatar": student.get("avatar_url"),

                "status": user_status,  # active | idle | inactive | blocked

                "course_id": str(
                    enrollment["course_id"]
                ),

                "course_name": (
                    course.get("title")
                    if course else ""
                ),

                "progress": progress,

                "progress_summary": {

                    "completed_lessons": completed_lessons,

                    "total_lessons": total_lessons
                },

                "enrolled_at": (
                    enrollment.get("created_at").strftime("%d/%m/%Y")
                    if enrollment.get("created_at")
                    else None
                ),

                "last_active": self.format_last_active(
                    enrollment.get("last_accessed_at")
                ),

                "actions": {

                    "can_view_progress": True,

                    "can_send_reminder": True,

                    "can_revoke_access": True
                }
            })

        # =========================================
        # 7. TOTAL STUDENTS
        # =========================================

        unique_students = set([

            str(e["user_id"])

            for e in enrollments
        ])

        total_students = len(unique_students)

        # =========================================
        # 8. ACTIVE LEARNERS
        # =========================================
        # Đếm số học viên có progress trong 30 ngày (CHỈ trong khóa học của instructor này)

        one_month_ago = (
            datetime.utcnow() - timedelta(days=30)
        )

        active_students = set()

        # Lấy tất cả lesson_id của các khóa học này
        lesson_ids = list(
            db.lessons.find(
                {"course_id": {"$in": course_ids}},
                {"_id": 1}
            )
        )
        lesson_ids_list = [l["_id"] for l in lesson_ids]

        # Chỉ đếm progress của các bài học thuộc khóa học của instructor này
        recent_progress = list(
            db.lesson_progress.find({
                "lesson_id": {"$in": lesson_ids_list},
                "updated_at": {
                    "$gte": one_month_ago
                }
            })
        )

        for progress in recent_progress:
            # Chỉ đếm nếu user_id có trong danh sách learner_ids
            if progress["user_id"] in learner_ids:
                active_students.add(
                    str(progress["user_id"])
                )
        active_learners = len(active_students)

        # =========================================
        # 9. AVG COMPLETION RATE
        # =========================================

        total_progress = sum([

            student["progress"]

            for student in response
        ])

        avg_completion_rate = 0

        if response:

            avg_completion_rate = int(
                total_progress / len(response)
            )

        # =========================================
        # 10. FINAL RESPONSE
        # =========================================

        return {

            "stats": {

                "total_students": total_students,

                "active_learners": active_learners,

                "avg_completion_rate": avg_completion_rate
            },

            "students": response
        }
    
    def calculate_course_progress(
        self,
        user_id,
        course_id
    ):

        # ====================================
        # TOTAL LESSONS
        # ====================================

        total_lessons = db.lessons.count_documents({
            "course_id": course_id
        })

        if total_lessons == 0:
            return 0

        # ====================================
        # GET LESSON IDS
        # ====================================

        lessons = list(
            db.lessons.find({
                "course_id": course_id
            })
        )

        lesson_ids = [
            lesson["_id"]
            for lesson in lessons
        ]

        # ====================================
        # COMPLETED LESSONS
        # ====================================
        completed_lessons = db.lesson_progress.count_documents({

            "course_id": ObjectId(course_id),

            "user_id": ObjectId(user_id),

            "is_completed": True
        })

        # ====================================
        # FORMULA
        # ====================================

        progress = int(
            (completed_lessons / total_lessons) * 100
        )
        if progress > 100:
            progress = 100

        return progress
        

    def get_top_courses(self, instructor_id: str):

        pipeline = [
        {
            "$match": {
                "instructor_id": ObjectId(instructor_id),
                "status": "APPROVED",
                "is_deleted": {"$ne": True},
                "is_archived": {"$ne": True}
            }
        },
        {
            "$lookup": {
                "from": "enrollments",
                "localField": "_id",
                "foreignField": "course_id",
                "as": "enrollments"
            }
        },
        {
            "$addFields": {
                "student_count": {"$size": "$enrollments"},
                "revenue": {
                    "$multiply": [
                        {"$size": "$enrollments"},
                        {"$ifNull": ["$price", 0]}
                    ]
                }
            }
        },
        {
            "$sort": {"student_count": -1}
        },
        {
            "$limit": 5
        },
        {
            "$project": {
                "title": 1,
                "image": 1,
                "student_count": 1,
                "revenue": 1
            }
        }
    ]

        courses = list(
            db.courses.aggregate(pipeline)
        )

        return {
        "items": [
            {
                "id": str(c["_id"]),
                "title": c["title"],
                "image": c.get("image"),
                "students": c.get("student_count", 0),
                "revenue":  int(c.get("revenue", 0))
            }
            for c in courses
        ]
    }

    def calculate_average_completion_rate(
        self,
        instructor_id
    ):

        # ====================================
        # 1. LẤY COURSES
        # ====================================

        courses = list(
            db.courses.find({
                "instructor_id": ObjectId(instructor_id),
                "status": "APPROVED",
                "is_deleted": {"$ne": True}
            })
        )

        if not courses:
            return 0

        course_ids = [
            course["_id"]
            for course in courses
        ]

        # ====================================
        # 2. LẤY ENROLLMENTS
        # ====================================

        enrollments = list(
            db.enrollments.find({
                "course_id": {
                    "$in": course_ids
                }
            })
        )

        if not enrollments:
            return 0

        # ====================================
        # 3. TÍNH TOTAL PROGRESS
        # ====================================

        total_progress = 0

        for enrollment in enrollments:

            progress = self.calculate_course_progress(

                user_id=enrollment["user_id"],

                course_id=enrollment["course_id"]
            )

            total_progress += progress

        # ====================================
        # 4. AVG FORMULA
        # ====================================

        average_progress = int(
            total_progress / len(enrollments)
        )

        return average_progress
    



# singleton
instructor_service = InstructorService()