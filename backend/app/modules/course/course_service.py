from datetime import datetime
from bson import ObjectId
from app.modules.auth.auth_repository import get_user_by_id
from app.modules.video.video_repository import VideoRepository
from app.storage.gcs_client import GCSClient
from app.database.mongodb import db
from app.database.mongodb import db as _db
from .course_repository import CourseRepository
from app.modules.lesson.lesson_repository import LessonRepository
from fastapi import HTTPException
from bson.errors import InvalidId

from app.modules.enrollment.enrollment_repository import EnrollmentRepository



lesson_repository = LessonRepository()
enrollment_repository = EnrollmentRepository()
course_repository = CourseRepository()
video_repository = VideoRepository()
_gcs = GCSClient()


class CourseService:

    def __init__(self):
        self.repo = CourseRepository()

    # ===================== COMMON =====================

    def map_status(self, status: str):
        return {
            "DRAFT": "draft",
            "PENDING": "pending",
            "APPROVED": "published",
            "REJECTED": "rejected",
            "BLOCKED": "suspended",
            "UPDATED": "pending",
        }.get(status, status)

    def _category_display(self, cat_id: str):
        if not cat_id:
            return "—"

        DISPLAY_MAP = {
            "frontend": "Frontend Web Development",
            "backend": "Backend Web Development",
            "mobile": "Mobile Programming",
            "ai": "AI & Machine Learning",
            "data_analysis": "Data Analysis",
            "data_engineer": "Data Engineering",
            "uiux": "UI/UX Design",
            "ba": "Business Analysis",
        }

        return DISPLAY_MAP.get(cat_id, cat_id)

    @staticmethod
    def _dt_iso(value):
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value) if value else None

    @staticmethod
    def _duration_to_seconds(value: str) -> int:
        if not value:
            return 0

        raw = str(value).strip().lower()

        try:
            if ":" in raw:
                parts = [int(p) for p in raw.split(":")]

                if len(parts) == 2:
                    m, s = parts
                    return m * 60 + s

                if len(parts) == 3:
                    h, m, s = parts
                    return h * 3600 + m * 60 + s

        # fallback: chỉ số
            return int(float(raw))

        except:
            return 0

    @staticmethod
    def _seconds_to_hhmm(seconds: int) -> str:
        if not seconds:
            return "0m"

        h = seconds // 3600
        m = (seconds % 3600) // 60
        s = seconds % 60

        if h > 0:
            return f"{h}h {m}m"

        if m > 0:
            return f"{m}m"

        return f"{s}s"

    @staticmethod
    def _students_count(course: dict) -> int:
        # ưu tiên dữ liệu lưu sẵn trong document nếu có
        for key in ("students", "student_count", "students_count", "enrolled"):
            v = course.get(key)
            if isinstance(v, int):
                return max(v, 0)
            if isinstance(v, str) and v.isdigit():
                return int(v)
        # fallback: đếm collection enrollments nếu team có dùng
        try:
            return int(
                db.enrollments.count_documents({"course_id": ObjectId(str(course["_id"]))})
            )
        except Exception:
            return 0

    def _video_count(self, course_id: str) -> int:
        try:
            return len(video_repository.get_by_course(course_id))
        except Exception:
            return 0

    async def _serialize_public_card(self, c: dict):
        instructor_name = "Giảng viên EduSync"
        instructor_avatar = "https://i.pravatar.cc/150?img=11"
        iid = c.get("instructor_id")
        if iid:
            u = get_user_by_id(str(iid))
            if u:
                instructor_name = u.get("fullName") or u.get("email") or instructor_name
                instructor_avatar = u.get("avatar_url") or u.get("avatar") or instructor_avatar

        course_id = str(c.get("_id")) if c.get("_id") is not None else str(c.get("id", ""))
        
        # ✅ FIX SỐ LƯỢNG VIDEO: Fallback đếm từ các collection khác nếu mảng nhúng rỗng
        lessons_array = c.get("lessons", [])
        video_count = len(lessons_array)
        if video_count == 0:
            video_count = max(self._count_lessons(course_id), self._video_count(course_id))

        return {
            "id": course_id,
            "title": c.get("title", ""),
            "description": c.get("description", ""),
            "category": c.get("category", ""),
            "categoryLabel": self._category_display(c.get("category")),
            "thumbnail": c.get("image") or "",
            "price": float(c.get("price") or 0),
            "instructor": instructor_name,
            "instructor_avatar": instructor_avatar,
            "students": await self._count_students(course_id),
            "videoCount": video_count,
            "status": c.get("status"),
        }

    # ===================== PUBLIC =====================

    async def get_public_courses(self, page=1, limit=10):
 
        page = max(page, 1)
        limit = min(max(limit, 1), 100)
        skip = (page - 1) * limit

        pipeline = [
            {"$match": {"status": "APPROVED", "is_deleted": {"$ne": True}}},

            {"$sort": {"created_at": -1}},

            {"$skip": skip},
            {"$limit": limit},

            {"$lookup": {
                "from": "users",
                "localField": "instructor_id",
                "foreignField": "_id",
                "as": "_instructor",
            }},

            {"$lookup": {
                "from": "lessons",
                "localField": "_id",
                "foreignField": "course_id",
                "as": "_lessons",
            }},

            {"$lookup": {
                "from": "enrollments",
                "localField": "_id",
                "foreignField": "course_id",
                "as": "_enrollments",
            }},

            {"$addFields": {
                "_inst": {"$arrayElemAt": ["$_instructor", 0]},
                "lesson_count": {"$size": "$_lessons"},
                "student_count": {"$size": "$_enrollments"},
            }},

            {"$project": {
                "_instructor": 0,
                "_lessons": 0,
                "_enrollments": 0,
            }},
        ]

        courses = list(db.courses.aggregate(pipeline))

        total = db.courses.count_documents({
            "status": "APPROVED",
            "is_deleted": {"$ne": True},
        })

        items = []
        for c in courses:
            inst = c.get("_inst") or {}
            instructor_name = inst.get("fullName") or inst.get("email") or "Giảng viên EduSync"
            instructor_avatar = inst.get("avatar_url") or inst.get("avatar") or "https://i.pravatar.cc/150?img=11"

            course_id = str(c["_id"])

            # Ưu tiên lesson_count từ aggregation, fallback embedded lessons array
            video_count = c.get("lesson_count", 0)
            if video_count == 0:
                video_count = len(c.get("lessons", []))

            items.append({
                "id": course_id,
                "title": c.get("title", ""),
                "description": c.get("description", ""),
                "category": c.get("category", ""),
                "categoryLabel": self._category_display(c.get("category")),
                "thumbnail": c.get("image") or "",
                "price": float(c.get("price") or 0),
                "instructor": instructor_name,
                "instructor_avatar": instructor_avatar,
                "students": c.get("student_count", 0),
                "videoCount": video_count,
                "status": c.get("status"),
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def get_instructor_course_detail(
        self,
        course_id: str,
        instructor_id: str
    ):

        try:

            # print("👉 course_id:", course_id)

            # ====================================
            # FIX OBJECT ID
            # ====================================

            try:

                course_obj_id = ObjectId(course_id)

            except InvalidId:

                raise Exception("Invalid course_id")

            # ====================================
            # GET COURSE
            # ====================================

            course = await course_repository.get_by_id(
                course_id
            )

            # print("👉 course:", course)

            if not course:
                return None

            # ====================================
            # PERMISSION CHECK
            # ====================================

            if str(course.get(
                "instructor_id"
            )) != instructor_id:

                raise Exception(
                    "Permission denied"
                )

            # ====================================
            # GET INSTRUCTOR
            # ====================================

            instructor = db.users.find_one({

                "_id": ObjectId(instructor_id)

            })

            instructor_name = (
                instructor.get(
                    "fullName",
                    "Unknown"
                )
                if instructor
                else "Unknown"
            )

            avatar = (
                instructor.get(
                    "avatar_url",
                    ""
                )
                if instructor
                else ""
            )

            # ====================================
            # TOTAL STUDENTS
            # ====================================

            students = db.enrollments.count_documents({

                "course_id": course_obj_id

            })

            # ====================================
            # GET LESSONS
            # ====================================

            lessons_db = list(

                db.lessons.find({

                    "course_id": course_obj_id

                }).sort("order_index", 1)
            )

            # print("👉 lessons:", lessons_db)

            lessons_list = []

            total_seconds = 0

            # ====================================
            # LOOP LESSONS
            # ====================================

            for lesson in lessons_db:

                lesson_id = lesson.get("_id")

                # ====================================
                # GET VIDEOS
                # ====================================

                videos = list(

                    db.videos.find({

                        "lesson_id": lesson_id

                    }).sort("order_index", 1)
                )

                # ====================================
                # VIDEO ITEMS
                # ====================================

                video_items = []

                lesson_duration_seconds = 0

                for video in videos:

                    duration = video.get(
                        "duration",
                        "00:00"
                    )

                    lesson_duration_seconds += (
                        self._duration_to_seconds(
                            duration
                        )
                    )

                    video_items.append({

                        "id": str(video.get("_id")),

                        "title": video.get(
                            "title",
                            ""
                        ),

                        "description": video.get(
                            "description",
                            ""
                        ),

                        "video_url": video.get(
                            "video_url",
                            ""
                        ),

                        "thumbnail_url": video.get(
                            "thumbnail_url",
                            ""
                        ),

                        "duration": duration,

                        "views": video.get(
                            "views",
                            0
                        ),

                        "order_index": video.get(
                            "order_index",
                            0
                        ),

                        "is_preview": video.get(
                            "is_preview",
                            False
                        )
                    })

                # ====================================
                # TOTAL COURSE DURATION
                # ====================================

                total_seconds += lesson_duration_seconds

                # ====================================
                # LESSON ITEM
                # ====================================

                lessons_list.append({

                    "id": str(
                        lesson.get("_id", "")
                    ),

                    "title": lesson.get(
                        "title",
                        ""
                    ),

                    "description": lesson.get(
                        "description",
                        ""
                    ),

                    "duration": self._seconds_to_hhmm(
                        lesson_duration_seconds
                    ),

                    "video_count": len(
                        video_items
                    ),

                    "videos": video_items,

                    "completion": "0%",

                    "is_published": lesson.get(
                        "is_published",
                        True
                    ),

                    "isPublished": lesson.get(
                        "is_published",
                        True
                    ),

                    "is_approved": lesson.get(
                        "is_approved",
                        True
                    )
                })

            # ====================================
            # RETURN
            # ====================================

            return {

                "courseDetail": {

                    "id": str(
                        course.get("_id", "")
                    ),

                    "title": course.get(
                        "title",
                        ""
                    ),

                    "description": course.get(
                        "description",
                        ""
                    ),

                    "category": self._category_display(
                        course.get("category")
                    ),

                    "instructor": instructor_name,

                    "students": students,

                    "students_enrolled": students,

                    "duration": self._seconds_to_hhmm(
                        total_seconds
                    ),

                    "lessonCount": len(
                        lessons_list
                    ),

                    "price": course.get(
                        "price",
                        0
                    ),

                    "thumbnail": course.get(
                        "image",
                        ""
                    ),

                    "avatar": avatar,

                    "status": self.map_status(
                        course.get(
                            "status",
                            "DRAFT"
                        )
                    )
                },

                "lessonsList": lessons_list
            }

        except Exception as e:

            print("❌ ERROR:", str(e))

            raise e

    async def get_public_course_detail(self, course_id: str):
        try:
            course = await course_repository.get_public_by_id(course_id)


            if not course:
                raise Exception("Course not found")

        # 🔥 Instructor
            instructor = get_user_by_id(str(course.get("instructor_id")))
            instructor_name = instructor.get("fullName") if instructor else "Unknown"
            avatar = instructor.get("avatar_url", "") if instructor else ""


        # 👉 instructor
            instructor = None
            iid = course.get("instructor_id")
            if iid:
                user = get_user_by_id(str(iid))
                if user:
                    instructor = {
                    "id": str(iid),
                    "name": user.get("fullName") or user.get("email"),
                    # "title": "Senior Software Engineer",
                    "title": "Instructor",
                    # ✅ FIX: DB lưu là avatar_url (snake_case), thử cả 2 field để tương thích
                    "avatar": user.get("avatar_url") or user.get("avatar") or "https://i.pravatar.cc/150?img=11"
                    # "avatar": user.get("avatar_url") or ""
                }

        # 🔥 lấy lesson theo course
            lessons_db = list(db.lessons.find({
                "course_id": ObjectId(course_id)
            }).sort("order_index", 1))

            lessons = []
            total_seconds = 0


            # ✅ FIX _id
            for lesson in lessons_db:
                lesson_id = str(lesson.get("_id") or lesson.get("id"))
                videos = video_repository.get_by_lesson(lesson_id)
                video = videos[0] if videos else {}

                duration = video.get("duration", "00:00")
                if not duration:
                    duration = "00:00"
                total_seconds += self._duration_to_seconds(duration)
                print("VIDEO:", video)

                storage_path = video.get("storage_path")

                if storage_path:
                    try:
                        video_url = _gcs.generate_read_signed_url(storage_path)
                    except Exception as e:
                        print("❌ SIGNED URL ERROR:", e)
                        video_url = ""
                else:
                    video_url = video.get("video_url") or video.get("play_url") or ""

                lessons.append({
                    "id": str(lesson["_id"]),
                    "video_id": str(video.get("_id", "")),
                    "title": lesson.get("title", ""),
                    "duration": duration,
                    "views": video.get("views", 0),
                    "created_at": video.get("created_at"),
                    "thumbnail": video.get("thumbnail_url") or course.get("image", ""),
                    "videoUrl": video_url,
               })

        # 🔥 RETURN ĐÚNG FORMAT
            return {
                "id": str(course["_id"]),
                "title": course.get("title", ""),
                "description": course.get("description", ""),
                "category": self._category_display(course.get("category")),
                "price": course.get("price", 0),
                "thumbnail": course.get("image", ""),

            # ✅ FIX QUAN TRỌNG
                "instructor": {
                    "id": str(instructor.get("_id")) if instructor else "",
                    "name": instructor_name,
                    "avatar": avatar
                },

                "duration": self._seconds_to_hhmm(total_seconds),
                "lessonCount": len(lessons),
                "lessons": lessons
        }

        except Exception as e:
            print("❌ Get course detail error:", e)
            raise
    # ===================== SEARCH =====================

    async def search_courses(
        self,
        keyword=None,
        category=None,
        price=None,
        min_price=None,
        max_price=None,
        sort="newest",
        page=1,
        limit=10
):
        filter = {"status": "APPROVED"}

    # 🔍 Search theo tên
        if keyword:
            filter["title"] = {"$regex": keyword, "$options": "i"}

    # 🎯 Category
        if category and category.lower() != "all":
            filter["category"] = category
        
        price_cond = {}

    # 💰 Price (preset)
        if price:
            if price == "under_1m":
               filter["price"] = {"$lt": 1_000_000}
            elif price == "1m_3m":
                filter["price"] = {"$gte": 1_000_000, "$lte": 3_000_000}
            elif price == "over_3m":
                filter["price"] = {"$gt": 3_000_000}

    # 💰 Price (range override)
        if min_price is not None or max_price is not None:
            price_cond = {}
        if min_price is not None:
            price_cond["$gte"] = min_price
        if max_price is not None:
            price_cond["$lte"] = max_price
        if price_cond:
            filter["price"] = price_cond

    # 📊 Sort
        if sort == "price_asc":
            sort_option = [("price", 1)]
        elif sort == "price_desc":
            sort_option = [("price", -1)]
        else:
            sort_option = [("created_at", -1)]

        courses = await course_repository.find_public(
            filter, page, limit, sort_option
    )
        total = await course_repository.count(filter)

        items = []
        for c in courses:
            item = await self._serialize_public_card(c)
            items.append(item)

        return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
    }

    # ===================== INSTRUCTOR =====================

    async def get_instructor_courses(self, instructor_id: str):
        courses = await course_repository.find_by_instructor(instructor_id)
        result = []
        for c in courses:
            course_id = str(c.get("_id")) if c.get("_id") else c.get("id")

            # Đếm độ dài của mảng lessons nhúng trong course
            lessons_array = c.get("lessons") or []
            lesson_count = len(lessons_array)
            if lesson_count == 0:
                lesson_count = max(self._count_lessons(course_id), self._video_count(course_id))

            result.append({
                "id": course_id,
                "title": c.get("title", ""),
                "category": self._category_display(c.get("category", "")),
                "status": self.map_status(c.get("status")),
                "students": await self._count_students(course_id), 
                "lessons": lesson_count, 
                "price": c.get("price", 0),
                "image": c.get("image", "")
            })

        return result
    
    async def _count_students(self, course_id: str):
        try:
            return await enrollment_repository.count_by_course(course_id)
        except:
            return 0  # sau này bạn thay bằng query thật
    
    def _count_lessons(self, course_id: str):
        try:
            return db.lessons.count_documents({
            "course_id": ObjectId(course_id)
        })
        except Exception as e:
            print("Count lesson error:", e)
            return 0
     

    async def create_course(self, data: dict, instructor_id: str):
        if not data.get("title"):
            raise Exception("Title is required")

        if len(data.get("title", "")) < 5:
            raise Exception("Title too short")

        course = {
            "title": data.get("title"),
            "description": data.get("description", ""),
            "category": data.get("category", ""),
            "image": (data.get("image") or "").strip(),
            "price": 0,
            "status": "DRAFT",
            "instructor_id": ObjectId(instructor_id),
            "is_locked": False,
        }

        course_id = await course_repository.create(course)

        return {
            "id": course_id,
            "message": "Course created successfully",
        }

    async def submit_course(self, course_id: str, instructor_id: str):
        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        if course.get("status") != "DRAFT":
            raise Exception("Course already submitted")

        if str(course.get("instructor_id")) != instructor_id:
            raise Exception("Unauthorized")

        await course_repository.update(course_id, {
            "status": "PENDING",
            "is_locked": True,
            "submitted_at": datetime.utcnow(),
        })

        return {"message": "Submitted successfully"}
    

    async def update_course(self, course_id: str, instructor_id: str, data: dict):
        """
        Cập nhật khóa học theo mô hình Two-layer State Management.
        """
        # 1. LẤY COURSE
        course = db.courses.find_one({
            "_id": ObjectId(course_id),
            "is_deleted": {"$ne": True}
        })

        if not course:
            raise Exception("Course not found")

        # 2. CHECK QUYỀN
        if str(course.get("instructor_id")) != instructor_id:
            raise Exception("Permission denied")

        # 3. TÁCH LESSONS KHỎI DATA
        lessons = data.pop("lessons", [])

        # 4. KHÔNG CHO FE TỰ Ý GỬI status & price
        data.pop("status", None)
        data.pop("price", None)

        current_status = course.get("status", "DRAFT")

        # 5. XỬ LÝ NGHIỆP VỤ THEO TỪNG TRẠNG THÁI
        if current_status == "APPROVED":
            data["has_pending_update"] = True
            data["updated_at"] = datetime.utcnow()

        elif current_status == "REJECTED":
            data["status"] = "PENDING"
            data["has_pending_update"] = False

        # 6. SỬ DỤNG REPOSITORY ĐỂ LƯU
        result = await self.repo.update_with_lessons(
            course_id,
            data,
            lessons
        )

        if not result.get("success"):
            raise Exception(result.get("error", "Failed to update course"))

        new_count = result.get("new_lessons_count", 0)
        return {
            "message": "Course updated successfully",
            "lessons_updated": result.get("lessons_count", 0),
            "new_lessons_pending_review": new_count,
        }

    async def recalculate_course_duration(self, course_id: str):

        lessons = list(db.lessons.find({
            "course_id": ObjectId(course_id)
        }))

        total_seconds = 0

        for lesson in lessons:

            videos = list(db.videos.find({
                "lesson_id": lesson["_id"]
            }))

            lesson_seconds = 0

            for video in videos:

                duration = video.get("duration", "00:00")

                lesson_seconds += self._duration_to_seconds(duration)

            # update lesson duration
            db.lessons.update_one(
                {
                    "_id": lesson["_id"]
                },
                {
                    "$set": {
                        "duration": self._seconds_to_hhmm(
                            lesson_seconds
                        )
                    }
                }
            )

            total_seconds += lesson_seconds

        # update course duration
        db.courses.update_one(
            {
                "_id": ObjectId(course_id)
            },
            {
                "$set": {
                    "duration": self._seconds_to_hhmm(
                        total_seconds
                    ),
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return {
            "total_duration": self._seconds_to_hhmm(total_seconds)
        }
    

    async def delete_course(self, course_id: str, instructor_id: str):

        course = db.courses.find_one({
        "_id": ObjectId(course_id)
    })

        if not course:
           raise Exception("Course not found")

        if str(course.get("instructor_id")) != instructor_id:
           raise Exception("Permission denied")

        enrolled_count = db.enrollments.count_documents({
            "course_id": ObjectId(course_id)
        })
        if enrolled_count > 0:
            raise Exception("Cannot delete course with enrolled students")

        db.courses.update_one(
        {"_id": ObjectId(course_id)},
        {
            "$set": {
                "is_deleted": True
            }
        }
    )

        return {"message": "Course deleted successfully"}



    # ===================== LEARNER =====================
    async def enroll(
        self,
        course_id: str,
        user_id: str
    ):

        # ====================================
        # CHECK ALREADY ENROLLED
        # ====================================

        exists = db.enrollments.find_one({

            "course_id": ObjectId(course_id),

            "learner_id": ObjectId(user_id)
        })

        if exists:

            return {
                "message": "Already enrolled"
            }

        # ====================================
        # INSERT ENROLLMENT
        # ====================================

        enrollment = {

            "course_id": ObjectId(course_id),

            "learner_id": ObjectId(user_id),

            # ngày enroll
            "created_at": datetime.utcnow(),

            # lần truy cập cuối
            "last_accessed_at": datetime.utcnow()
        }

        result = db.enrollments.insert_one(
            enrollment
        )

        # ====================================
        # RESPONSE
        # ====================================

        return {

            "message": "Enrolled successfully",

            "enrollment_id": str(
                result.inserted_id
            )
        }
        

    async def get_course_students(self, course_id: str):
        enrollments = list(db.enrollments.find({
        "course_id": ObjectId(course_id)
    }))

        user_ids = [e["learner_id"] for e in enrollments]

        users = list(db.users.find({
        "_id": {"$in": user_ids}
    }))

        return [
            {
            "id": str(u["_id"]),
            "name": u.get("fullName"),
            "email": u.get("email"),
            "avatar": u.get("avatar_url")
        }
        for u in users
    ]


    async def unenroll(self, course_id: str, user_id: str):

        result = db.enrollments.delete_one({
        "course_id": ObjectId(course_id),
        "learner_id": ObjectId(user_id)
    })

        if result.deleted_count == 0:
            return {"message": "Not enrolled"}

        return {"message": "Unenrolled successfully"}
    

    async def get_my_courses(self, user_id: str):   

        enrollments = list(db.enrollments.find({
        "learner_id": ObjectId(user_id)
    }))

        course_ids = [e["course_id"] for e in enrollments]

        courses = list(db.courses.find({
        "_id": {"$in": course_ids}
    }))

        return [
        {
            "id": str(c["_id"]),
            "title": c.get("title"),
            "image": c.get("image"),
            "price": c.get("price", 0),
            "status": c.get("status")
        }
        for c in courses
    ]

    

    # ===================== ADMIN =====================

    async def get_pending_courses(self, page=1, limit=10):
        # TÌM KHÓA PENDING HOẶC KHÓA APPROVED ĐANG CÓ CỜ UPDATE
        filter = {
            "$or": [
                {"status": "PENDING"},
                {"has_pending_update": True}
            ]
        }

        courses = await course_repository.find_public(filter, page, limit,[("created_at", -1)] )
        total = await course_repository.count(filter)

        items = []
        for c in courses:
            instructor_name = "Giảng viên EduSync"
            iid = c.get("instructor_id")
            if iid:
                u = get_user_by_id(str(iid))
                if u:
                    instructor_name = u.get("fullName") or u.get("email") or instructor_name

            course_id = str(c.get("_id")) if c.get("_id") is not None else str(c.get("id", ""))
            submitted_at = c.get("submitted_at") or c.get("updated_at") or c.get("created_at")
            
            lessons_array = c.get("lessons", [])
            v_count = len(lessons_array)
            if v_count == 0:
                v_count = max(self._count_lessons(course_id), self._video_count(course_id))

            items.append({
                "id": course_id,
                "title": c.get("title", ""),
                "thumbnail": c.get("image") or "",
                "instructor": instructor_name,
                "submittedAt": self._dt_iso(submitted_at),
                "videoCount": v_count,
                "status": str(c.get("status", "")).lower(),
                "has_pending_update": c.get("has_pending_update", False)
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def approve_course(self, course_id: str, price: float):

        course_obj_id = ObjectId(course_id)

    # 🔥 1. Lấy lesson theo course_id (NEW)
        lessons = list(_db.lessons.find(
            {"course_id": course_obj_id},
            {"_id": 1}
    ))

        lesson_ids = [l["_id"] for l in lessons]

    # 🔥 2. Approve lessons
        if lesson_ids:
            _db.lessons.update_many(
            {"_id": {"$in": lesson_ids}},
            {"$set": {"is_approved": True}}
        )

    # 🔥 3. Approve videos
        if lesson_ids:
            _db.videos.update_many(
            {"lesson_id": {"$in": lesson_ids}},
            {"$set": {"is_approved": True}}
        )

    # 🔥 4. Update course
        await course_repository.update(course_id, {
        "status": "APPROVED",
        "price": price,
        "is_locked": False,
        "has_pending_update": False,
        "has_new_update": False,
    })

        return {"message": "Course approved"}

    async def reject_course(self, course_id: str, reason: str = ""):
        await course_repository.update(course_id, {
            "status": "REJECTED",
            "reject_reason": reason,
            "is_locked": False,
            "has_pending_update": False,
            "has_new_update": False,
        })
        return {"message": "Course rejected"}

    async def resolve_pending_update(self, course_id: str, new_price: float | None = None):
        """
        Admin xử lý bản cập nhật của khóa học đang PUBLISHED
        """

        _db.courses.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": {"lessons.$[].is_approved": True}}
        )

        update_data = {
            "has_pending_update": False,
            "has_new_update": False,   
        }
        if new_price is not None:
            update_data["price"] = new_price

        await course_repository.update(course_id, update_data)
        return {"message": "Pending update resolved, all lessons approved"}

    async def get_admin_course_detail(self, course_id: str):
        course = await course_repository.get_by_id(course_id)

        if not course:
            return None

        raw_videos = video_repository.get_by_course(course_id)
        embedded_lessons = course.get("lessons") or []

        approval_by_title = {}
        for el in embedded_lessons:
            title = (el.get("title") or "").strip()
            if title:
                approval_by_title[title] = el.get("is_approved", True)

        titles_in_videos = set()
        lessons = []

        for i, l in enumerate(raw_videos):
            raw_url = l.get("video_url") or l.get("url") or ""
            path = l.get("storage_path") or _gcs.object_name_from_public_url(raw_url)

            play_url = ""
            if path:
                try:
                    play_url = _gcs.generate_read_signed_url(path)
                except Exception as e:
                    play_url = raw_url or ""
            else:
                if raw_url:
                    play_url = raw_url

            title = l.get("title") or l.get("file_name") or f"Bài {i+1}"
            titles_in_videos.add(title.strip())

            is_approved = approval_by_title.get(title.strip(), True)

            lessons.append({
                "id": str(l.get("_id") or f"v{i+1}"),
                "title": title,
                "duration": l.get("duration") or "10:00",
                "size": l.get("size") or "—",
                "thumbnail_url": (l.get("thumbnail_url") or "").strip(),
                "play_url": play_url, 
                "url": raw_url,
                "is_approved": is_approved,
            })

        for el in embedded_lessons:
            el_title = (el.get("title") or "").strip()
            if el_title and el_title not in titles_in_videos:
                lessons.append({
                    "id": str(el.get("_id") or el.get("id") or el_title),
                    "title": el_title,
                    "duration": el.get("duration") or "10:00",
                    "size": el.get("size") or "—",
                    "thumbnail_url": (el.get("thumbnail_url") or "").strip(),
                    "play_url": "",   
                    "url": "",
                    "is_approved": el.get("is_approved", True),
                })

        instructor_name = "Giảng viên EduSync"
        iid = course.get("instructor_id")
        if iid:
            u = get_user_by_id(str(iid))
            if u:
                instructor_name = u.get("fullName") or u.get("email") or instructor_name

        pending_lesson_count = sum(1 for l in lessons if not l.get("is_approved", True))

        return {
            "id": course.get("id"),
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "category": self._category_display(course.get("category")),
            "price": float(course.get("price") or 0),
            # "status": str(course.get("status") or "").lower(),
            "status": self.map_status(course.get("status")),

            "thumbnail": course.get("image") or "",
            "instructor": instructor_name,
            "has_new_update": bool(
                course.get("has_pending_update") or course.get("has_new_update", False)
            ),
            "pending_lesson_count": pending_lesson_count,
            "rejectReason": course.get("reject_reason", ""),
            "updatedAt": self._dt_iso(course.get("updated_at")),
            "lessons": lessons
        }
    
    async def get_admin_courses(self, q=None, category=None, status=None, page=1, limit=10):
        filter_query = {}

        # 🔍 SEARCH
        if q:
            filter_query["title"] = {"$regex": q, "$options": "i"}

        # 🟦 FILTER CATEGORY
        if category and category != "all":
            filter_query["category"] = category

        # 🟨 FILTER STATUS
        if status and status != "all":
            filter_query["status"] = status.upper()

        skip = (page - 1) * limit

        courses = list(
            db.courses.find(filter_query)
            .skip(skip)
            .limit(limit)
        )

        total = db.courses.count_documents(filter_query)

        result = []

        for course in courses:
            course_status = course.get("status")

            # 🎯 ACTION THEO STATUS
            if course_status == "APPROVED":
                actions = ["handle_update", "block", "delete"]

            elif course_status == "UPDATED":
                actions = ["approve", "delete"]

            elif course_status == "PENDING":
                actions = ["approve", "delete"]

            elif course_status == "REJECTED":
                actions = ["view", "delete"]

            elif course_status == "DRAFT":
                actions = ["view"]

            else:
                actions = []
                
            instructor_name = "Giảng viên EduSync"
            iid = course.get("instructor_id")
            if iid:
                u = get_user_by_id(str(iid))
                if u:
                    instructor_name = u.get("fullName") or u.get("email") or instructor_name

            instructor_name = "Giảng viên EduSync"
            iid = course.get("instructor_id")
            if iid:
                u = get_user_by_id(str(iid))
                if u:
                    instructor_name = u.get("fullName") or u.get("email") or instructor_name

            result.append({
                "id": str(course["_id"]),
                "title": course.get("title"),

                "thumbnail": course.get("image") or course.get("thumbnail"),
                "category": course.get("category"),
                "price": course.get("price"),
                "status": self.map_status(course_status),
                "actions": actions,
                "instructor": instructor_name,
                "has_new_update": course.get("has_pending_update", False)

            })

        return {
            "courses": result,
            "total": total
        }
    
    

    # ===================== FILTER & TOP COURSES =====================

    async def filter_courses(self, category: str = "all", price: str = "all", page: int = 1, limit: int = 10):
        filter = {"status": "APPROVED"}

        if category and category != "all":
            filter["category"] = category

        if price and price != "all":
            if price == "free":
                filter["price"] = 0
            elif price == "under_500k":
                filter["price"] = {"$gt": 0, "$lt": 500000}
            elif price == "500k_to_1m":
                filter["price"] = {"$gte": 500000, "$lt": 1000000}
            elif price == "1m_to_2m":
                filter["price"] = {"$gte": 1000000, "$lt": 2000000}
            elif price == "over_2m":
                filter["price"] = {"$gt": 2000000}

        courses = await course_repository.find_public( filter, page, limit, [("created_at", -1)])
        total = await course_repository.count(filter)

        items = []
        for c in courses:
            item = await self._serialize_public_card(c)
            items.append(item)

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
        }
    

    async def moderate_course(self, course_id: str, status: str):

        if not ObjectId.is_valid(course_id):
            raise HTTPException(400, "Invalid course_id")

        result = db.courses.update_one(
             {"_id": ObjectId(course_id)},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
    )

        if result.matched_count == 0:
            raise HTTPException(404, "Course not found")

        return {
        "message": "Updated successfully",
        "course_id": course_id,
        "status": status
    }

    async def get_top_courses(self, instructor_id: str):
        try:
            courses = await course_repository.find_by_instructor(instructor_id)

            result = []

            for course in courses:
                course_id = course["id"]

            # 👇 đếm số học viên
                students = await enrollment_repository.count_by_course(course_id)

                revenue = students * course.get("price", 0)

                result.append({
                "id": course_id,
                "title": course.get("title"),
                "image": course.get("thumbnail") or course.get("image"),
                "students": students,
                "revenue": revenue
            })

        # 👉 sort top
            result.sort(key=lambda x: x["students"], reverse=True)

            return {
            "items": result[:5]
        }

        except Exception as e:
            print("❌ get_top_courses error:", e)
        raise e
    
    async def get_featured_courses(self):

        courses = course_repository.get_featured_courses()

        result = []

        for c in courses:

            instructor_name = "Unknown"

            instructor = db.users.find_one({
                "_id": c.get("instructor_id")
            })

            if instructor:
                instructor_name = instructor.get("fullName", "Unknown")

            lesson_count = db.lessons.count_documents({
                "course_id": c["_id"]
            })

            result.append({
                "id": str(c["_id"]),
                "title": c.get("title"),
                "thumbnail": c.get("thumbnail"),
                "price": c.get("price", 0),
                "students": c.get("students_count", 0),
                "lesson_count": lesson_count,
                "instructor": instructor_name,
                "category": c.get("category"),
            })

        return result

        
course_service = CourseService()