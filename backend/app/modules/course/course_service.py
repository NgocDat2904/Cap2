from datetime import datetime
from bson import ObjectId

from app.modules.auth.auth_repository import get_user_by_id
from app.storage.gcs_client import GCSClient
from .course_repository import CourseRepository

course_repository = CourseRepository()
_gcs = GCSClient()


_CATEGORY_LABELS = {
    "frontend": "Frontend Web Development",
    "backend": "Backend Web Development",
    "mobile": "Mobile Programming",
    "ai": "AI & Machine Learning",
    "data_analysis": "Data Analysis",
    "data_engineer": "Data Engineering",
    "uiux": "UI/UX Design",
    "ba": "Business Analysis",
}


class CourseService:

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
        return _CATEGORY_LABELS.get(cat_id, cat_id)

    @staticmethod
    def _dt_iso(value):
        if isinstance(value, datetime):
            return value.isoformat()
        return str(value) if value else None

    # ===================== PUBLIC =====================

    async def get_public_courses(self, page=1, limit=10):
        filter = {"status": "APPROVED"}

        courses = course_repository.find_public(filter, page, limit)
        total = course_repository.count(filter)

        return {
            "items": courses,
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def get_public_course_detail(self, course_id: str):
        course = await course_repository.get_public_by_id_with_sections(course_id)

        if not course:
            return None

        course_thumb = (course.get("image") or "").strip()

        # ===================== INSTRUCTOR =====================
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

        # ===================== SECTIONS + LESSONS =====================
        sections = []
        total_lessons = 0

        for sec in course.get("sections", []):
            lessons = []

            for i, l in enumerate(sec.get("lessons", [])):
                raw_url = l.get("url") or ""

                path = l.get("storage_path") or _gcs.object_name_from_public_url(raw_url)

                if path:
                    try:
                        play_url = _gcs.generate_read_signed_url(path)
                    except Exception:
                        play_url = raw_url
                else:
                    play_url = raw_url

                lessons.append({
                    "id": str(l.get("_id")),
                    "title": l.get("title") or f"Bài {i+1}",
                    "duration": l.get("duration") or "10:00",
                    "views": l.get("views") or 1000,
                    "image": (l.get("image") or "").strip() or course_thumb,
                    "play_url": play_url
                })

            total_lessons += len(lessons)

            sections.append({
                "id": str(sec.get("_id")),
                "title": sec.get("title"),
                "lessons": lessons
            })

        return {
            "id": str(course["_id"]),
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "category": self._category_display(course.get("category")),
            "price": float(course.get("price") or 0),
            "thumbnail": course_thumb,
            "instructor": instructor,
            "students": 1520,
            "duration": "8h 30m",
            "lessonCount": total_lessons,
            "sections": sections
        }

    # ===================== SEARCH =====================

    async def search_courses(self, keyword="", category="", page=1, limit=10):
        filter = {"status": "APPROVED"}

        if keyword:
            filter["$text"] = {"$search": keyword}

        if category:
            filter["category"] = category

        courses = course_repository.search(filter, page, limit)
        total = course_repository.count(filter)

        return {
            "items": courses,
            "total": total,
            "page": page,
            "limit": limit,
        }

    # ===================== INSTRUCTOR =====================

    async def get_instructor_courses(self, instructor_id: str):
        courses = await course_repository.find_by_instructor(instructor_id)

        result = []
        for c in courses:
            result.append({
                "id": c["id"],
                "title": c.get("title", ""),
                "category": self._category_display(c.get("category", "")),
                "status": self.map_status(c.get("status")),
                "students": 0,
                "price": c.get("price", 0),
                "image": c.get("image", ""),
            })

        return result

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
        })

        return {"message": "Submitted successfully"}

    # ===================== ADMIN =====================

    async def get_pending_courses(self, page=1, limit=10):
        filter = {"status": "PENDING"}

        courses = course_repository.find_public(filter, page, limit)
        total = course_repository.count(filter)

        return {
            "items": courses,
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def approve_course(self, course_id: str, price: float):
        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        await course_repository.update(course_id, {
            "status": "APPROVED",
            "price": price,
            "is_locked": False
        })

        return {"message": "Course approved"}

    async def reject_course(self, course_id: str, reason: str = ""):
        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        await course_repository.update(course_id, {
            "status": "REJECTED",
            "reject_reason": reason,
            "is_locked": False
        })

        return {"message": "Course rejected"}

    async def get_admin_course_detail(self, course_id: str):
        course = await course_repository.get_public_by_id_with_sections(course_id)

        if not course:
            return None

        iid = str(course.get("instructor_id")) if course.get("instructor_id") else None
        instructor_name = "—"

        if iid:
            u = get_user_by_id(iid)
            if u:
                instructor_name = u.get("fullName") or u.get("email") or "—"

        return {
            "id": str(course["_id"]),
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "instructor": instructor_name,
            "category": self._category_display(course.get("category")),
            "price": float(course.get("price") or 0),
            "status": course.get("status"),
            "thumbnail": course.get("image") or "",
            "sections": course.get("sections", [])
        }