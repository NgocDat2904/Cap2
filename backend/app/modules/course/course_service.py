from datetime import datetime
from bson import ObjectId
from app.modules.auth.auth_repository import get_user_by_id
from app.modules.video.video_repository import VideoRepository
from app.storage.gcs_client import GCSClient
from app.database.mongodb import db
from .course_repository import CourseRepository

course_repository = CourseRepository()
video_repository = VideoRepository()
_gcs = GCSClient()


class CourseService:

    def __init__(self):
        self.repo = CourseRepository()

    # ===================== COMMON =====================

    def map_status(self, status: str):
        return {
            "DRAFT": "Draft",
            "PENDING": "Pending",
            "APPROVED": "Published",
            "REJECTED": "Rejected",
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
        """
        Hỗ trợ định dạng:
        - mm:ss (vd 10:30)
        - hh:mm:ss (vd 01:05:20)
        - 10m / 2h / 45s
        """
        if not value:
            return 0
        raw = str(value).strip().lower()
        if not raw:
            return 0

        try:
            if ":" in raw:
                parts = [int(p) for p in raw.split(":")]
                if len(parts) == 2:
                    mm, ss = parts
                    return mm * 60 + ss
                if len(parts) == 3:
                    hh, mm, ss = parts
                    return hh * 3600 + mm * 60 + ss
                return 0

            if raw.endswith("h"):
                return int(raw[:-1]) * 3600
            if raw.endswith("m"):
                return int(raw[:-1]) * 60
            if raw.endswith("s"):
                return int(raw[:-1])
            return int(float(raw))
        except Exception:
            return 0

    @staticmethod
    def _seconds_to_hhmm(seconds: int) -> str:
        seconds = max(int(seconds or 0), 0)
        h = seconds // 3600
        m = (seconds % 3600) // 60
        if h > 0:
            return f"{h}h {m}m"
        return f"{m}m"

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

    def _serialize_public_card(self, c: dict):
        instructor_name = "Giảng viên EduSync"
        iid = c.get("instructor_id")
        if iid:
            u = get_user_by_id(str(iid))
            if u:
                instructor_name = u.get("fullName") or u.get("email") or instructor_name

        course_id = str(c.get("_id")) if c.get("_id") is not None else str(c.get("id", ""))
        return {
            "id": course_id,
            "title": c.get("title", ""),
            "description": c.get("description", ""),
            "category": c.get("category", ""),
            "categoryLabel": self._category_display(c.get("category")),
            "thumbnail": c.get("image") or "",
            "price": float(c.get("price") or 0),
            "instructor": instructor_name,
            "students": int(c.get("students") or 0),
            "videoCount": self._video_count(course_id),
            "status": c.get("status"),
        }

    # ===================== PUBLIC =====================

    async def get_public_courses(self, page=1, limit=10):
        filter = {"status": "APPROVED"}

        courses = course_repository.find_public(filter, page, limit)
        total = course_repository.count(filter)

        return {
            "items": [self._serialize_public_card(c) for c in courses],
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def get_public_course_detail(self, course_id: str):
        try:
            course = await course_repository.get_public_by_id_with_sections(course_id)
        except Exception:
            course = None

        if not course:
            return None

        course_thumb = (course.get("image") or "").strip()

        instructor = None
        iid = course.get("instructor_id")

        if iid:
            user = get_user_by_id(str(iid))
            if user:
                instructor = {
                    "id": str(iid),
                    "name": user.get("fullName") or user.get("email"),
                    "title": "Senior Software Engineer",
                    "avatar": user.get("avatar") or "https://i.pravatar.cc/150?img=11"
                }

        # ===================== LESSONS (từ collection videos) =====================
        raw_lessons = video_repository.get_by_course(str(course.get("_id")))
        lessons = []
        for i, l in enumerate(raw_lessons):
            raw_url = l.get("video_url") or l.get("url") or ""
            path = l.get("storage_path") or _gcs.object_name_from_public_url(raw_url)

            play_url = ""
            if path:
                try:
                    play_url = _gcs.generate_read_signed_url(path)
                    print(f"✅ Generated signed URL for video: {path[:50]}...")
                except Exception as e:
                    print(f"❌ Failed to generate signed URL for {path}: {str(e)}")
                    play_url = raw_url or ""
            else:
                if raw_url:
                    print(f"⚠️ No storage_path found, using raw_url: {raw_url[:50]}...")
                    play_url = raw_url
                else:
                    print(f"⚠️ Video {i+1} has no URL or storage_path")

            lessons.append({
                "id": str(l.get("_id") or f"v{i+1}"),
                "title": l.get("title") or l.get("file_name") or f"Bài {i+1}",
                "duration": l.get("duration") or "10:00",
                "views": int(l.get("views") or 0),
                "image": (l.get("thumbnail_url") or "").strip() or course_thumb,
                "play_url": play_url,
            })

        sections = [{
            "id": "section-1",
            "title": "Nội dung khóa học",
            "lessons": lessons,
        }]
        total_lessons = len(lessons)
        total_seconds = sum(self._duration_to_seconds(l.get("duration")) for l in lessons)

        return {
            "id": str(course["_id"]),
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "category": self._category_display(course.get("category")),
            "price": float(course.get("price") or 0),
            "thumbnail": course_thumb,
            "instructor": instructor,
            "students": self._students_count(course),
            "duration": self._seconds_to_hhmm(total_seconds),
            "lessonCount": total_lessons,
            "sections": sections
        }

    # ===================== SEARCH =====================

    async def search_courses(self, keyword="", category="", page=1, limit=10):
        filter = {"status": "APPROVED"}

        if keyword:
            filter["title"] = {"$regex": keyword, "$options": "i"}

        if category:
            filter["category"] = category

        courses = course_repository.search(filter, page, limit)
        total = course_repository.count(filter)

        return {
            "items": [self._serialize_public_card(c) for c in courses],
            "total": total,
            "page": page,
            "limit": limit,
        }

    # ===================== INSTRUCTOR =====================

    async def get_instructor_courses(self, instructor_id: str):
        courses = await course_repository.find_by_instructor(instructor_id)

        return [
            {
                "id": c["id"],
                "title": c.get("title", ""),
                "category": self._category_display(c.get("category", "")),
                "status": self.map_status(c.get("status")),
                "students": 0,
                "price": c.get("price", 0),
                "image": c.get("image", ""),
            }
            for c in courses
        ]

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

    # ===================== ADMIN =====================

    async def get_pending_courses(self, page=1, limit=10):
        filter = {"status": "PENDING"}

        courses = course_repository.find_public(filter, page, limit)
        total = course_repository.count(filter)

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
            items.append({
                "id": course_id,
                "title": c.get("title", ""),
                "thumbnail": c.get("image") or "",
                "instructor": instructor_name,
                "submittedAt": self._dt_iso(submitted_at),
                "videoCount": self._video_count(course_id),
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def approve_course(self, course_id: str, price: float):
        await course_repository.update(course_id, {
            "status": "APPROVED",
            "price": price,
            "is_locked": False
        })
        return {"message": "Course approved"}

    async def reject_course(self, course_id: str, reason: str = ""):
        await course_repository.update(course_id, {
            "status": "REJECTED",
            "reject_reason": reason,
            "is_locked": False
        })
        return {"message": "Course rejected"}

    async def get_admin_course_detail(self, course_id: str):
        course = await course_repository.get_by_id(course_id)

        if not course:
            return None

        raw_lessons = video_repository.get_by_course(course_id)
        lessons = []
        for i, l in enumerate(raw_lessons):
            raw_url = l.get("video_url") or l.get("url") or ""
            path = l.get("storage_path") or _gcs.object_name_from_public_url(raw_url)
            
            play_url = ""
            if path:
                try:
                    play_url = _gcs.generate_read_signed_url(path)
                    print(f"✅ Generated signed URL for video: {path[:50]}...")
                except Exception as e:
                    print(f"❌ Failed to generate signed URL for {path}: {str(e)}")
                    play_url = raw_url or ""
            else:
                if raw_url:
                    print(f"⚠️ No storage_path found, using raw_url: {raw_url[:50]}...")
                    play_url = raw_url
                else:
                    print(f"⚠️ Video {i+1} has no URL or storage_path")

            lessons.append({
                "id": str(l.get("_id") or f"v{i+1}"),
                "title": l.get("title") or l.get("file_name") or f"Bài {i+1}",
                "duration": l.get("duration") or "10:00",
                "size": l.get("size") or "—",
                "thumbnail_url": (l.get("thumbnail_url") or "").strip(),
                "play_url": play_url,
                "url": raw_url,
            })

        instructor_name = "Giảng viên EduSync"
        iid = course.get("instructor_id")
        if iid:
            u = get_user_by_id(str(iid))
            if u:
                instructor_name = u.get("fullName") or u.get("email") or instructor_name

        return {
            "id": course.get("id"),
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "category": self._category_display(course.get("category")),
            "price": float(course.get("price") or 0),
            "status": str(course.get("status") or "").lower(),
            "thumbnail": course.get("image") or "",
            "instructor": instructor_name,
            "has_new_update": bool(course.get("has_new_update", False)),
            "rejectReason": course.get("reject_reason", ""),
            "updatedAt": self._dt_iso(course.get("updated_at")),
            "lessons": lessons,
            "sections": []
        }

    # ===================== FILTER & TOP COURSES =====================

    async def filter_courses(self, category: str = "all", price: str = "all", page: int = 1, limit: int = 10):
        """Lọc khóa học theo category và price range"""
        filter = {"status": "APPROVED"}

        # Lọc theo category
        if category and category != "all":
            filter["category"] = category

        # Lọc theo giá
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

        courses = course_repository.find_public(filter, page, limit)
        total = course_repository.count(filter)

        return {
            "items": [self._serialize_public_card(c) for c in courses],
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def get_top_courses(self, limit: int = 4):
        """Lấy 4 khóa học có nhiều học sinh nhất"""
        try:
            filter = {"status": "APPROVED"}
            
            # Lấy tất cả khóa học approved
            all_courses = course_repository.find_public(filter, page=1, limit=1000)
            
            if not all_courses:
                return {
                    "items": [],
                    "total": 0,
                }
            
            # Sắp xếp theo số học sinh (descending) và lấy top limit
            sorted_courses = sorted(
                all_courses, 
                key=lambda c: int(c.get("students", 0)), 
                reverse=True
            )[:limit]
            
            return {
                "items": [self._serialize_public_card(c) for c in sorted_courses],
                "total": len(sorted_courses),
            }
        except Exception as e:
            print("❌ Get top courses error:", e)
            return {
                "items": [],
                "total": 0,
            }