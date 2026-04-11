from datetime import datetime
from bson import ObjectId

from app.modules.video.video_repository import VideoRepository
from .course_repository import CourseRepository


course_repository = CourseRepository()
video_repository = VideoRepository()


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
        return _CATEGORY_LABELS.get(cat_id, "—") if cat_id else "—"

    @staticmethod
    def _instructor_id_str(course: dict):
        raw = course.get("instructor_id")
        return str(raw) if raw else None

    # ===================== PUBLIC =====================

    async def get_public_courses(self, page=1, limit=10):
        filter = {"status": "APPROVED"}

        courses = course_repository.find_public(filter, page, limit)
        total = course_repository.count(filter)

        return {
            "items": [
                {
                    "id": c["id"],
                    "title": c.get("title", ""),
                    "category": c.get("category", ""),
                    "price": c.get("price", 0),
                    "image": c.get("image", ""),
                }
                for c in courses
            ],
            "total": total,
            "page": page,
            "limit": limit,
        }

    # 🔥 FIX QUAN TRỌNG: chỉ lấy course APPROVED
    async def get_public_course_detail(self, course_id: str):
        course = await course_repository.get_public_by_id(course_id)

        if not course:
            return None

        videos = video_repository.get_by_course(course_id)
        thumb = (course.get("image") or "").strip()

        lessons = []
        for i, v in enumerate(videos):
            lessons.append({
                "id": str(v.get("_id", f"v{i}")),
                "title": v.get("title") or v.get("file_name") or f"Bài {i+1}",
                "play_url": v.get("url"),
                "thumbnail_url": (v.get("thumbnail_url") or "").strip() or thumb,
            })

        return {
            "id": course["id"],
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "category": self._category_display(course.get("category")),
            "price": float(course.get("price") or 0),
            "thumbnail": thumb,
            "lessons": lessons,
        }

    # ===================== SEARCH =====================

    async def search_courses(self, keyword="", category="", page=1, limit=10):
        filter = {"status": "APPROVED"}

        if keyword and keyword.strip():
            filter["$text"] = {"$search": keyword.strip()}

        if category:
            filter["category"] = category

        courses = course_repository.search(filter, page, limit)

        try:
            total = course_repository.count(filter)
        except:
            total = len(courses)

        return {
            "items": [
                {
                    "id": c["id"],
                    "title": c.get("title", ""),
                    "category": c.get("category", ""),
                    "price": c.get("price", 0),
                    "image": c.get("image", ""),
                }
                for c in courses
            ],
            "total": total,
            "page": page,
            "limit": limit,
        }

    # ===================== INSTRUCTOR =====================

    async def create_course(self, data: dict, instructor_id: str):
        if not data.get("title") or len(data.get("title")) < 5:
            raise Exception("Invalid title")

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

        cid = await course_repository.create(course)
        return {"id": cid, "message": "Course created successfully"}

    async def submit_course(self, course_id: str, instructor_id: str):
        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        if course.get("status") != "DRAFT":
            raise Exception("Already submitted")

        if self._instructor_id_str(course) != instructor_id:
            raise Exception("Unauthorized")

        if course.get("is_locked"):
            raise Exception("Locked")

        if not video_repository.get_by_course(course_id):
            raise Exception("Need at least 1 video")

        updated = await course_repository.update(
            course_id,
            {"status": "PENDING", "is_locked": True},
        )

        if not updated:
            raise Exception("Submit failed")

        return {"message": "Submitted"}

    async def get_instructor_courses(self, instructor_id: str):
        courses = await course_repository.find_by_instructor(instructor_id)

        return [
            {
                "id": c["id"],
                "title": c.get("title", ""),
                "category": c.get("category", ""),
                "status": self.map_status(c.get("status")),
                "price": c.get("price", 0),
                "image": c.get("image", ""),
            }
            for c in courses
        ]

    # ===================== ADMIN =====================

    async def get_pending_courses(self, page=1, limit=10):
        courses = await course_repository.find({"status": "PENDING"}, page, limit)
        total = course_repository.count({"status": "PENDING"})

        return {"items": courses, "total": total, "page": page, "limit": limit}

    async def get_admin_course_detail(self, course_id: str):
        return await course_repository.get_by_id(course_id)

    async def approve_course(self, course_id: str, price: float):
        if price is None or price < 0:
            raise Exception("Invalid price")

        updated = await course_repository.update(
            course_id,
            {"status": "APPROVED", "price": float(price)},
        )

        if not updated:
            raise Exception("Approve failed")

        return {"message": "Approved"}

    async def reject_course(self, course_id: str, reason: str = ""):
        updated = await course_repository.update(
            course_id,
            {
                "status": "REJECTED",
                "reject_reason": reason,
                "is_locked": False,
            },
        )

        if not updated:
            raise Exception("Reject failed")

        return {"message": "Rejected"}