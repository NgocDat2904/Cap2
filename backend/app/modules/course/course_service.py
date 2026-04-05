from datetime import datetime

from bson import ObjectId

from app.modules.auth.auth_repository import get_user_by_id
from app.modules.video.video_repository import VideoRepository
from app.storage.gcs_client import GCSClient
from .course_repository import CourseRepository


course_repository = CourseRepository()
video_repository = VideoRepository()
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

    def map_status(self, status: str):
        return {
            "DRAFT": "Draft",
            "PENDING": "Pending",
            "APPROVED": "Published",
            "REJECTED": "Rejected",
        }.get(status, status)

    def _category_display(self, cat_id: str) -> str:
        if not cat_id:
            return "—"
        return _CATEGORY_LABELS.get(cat_id, cat_id)

    @staticmethod
    def _instructor_id_str(course: dict) -> str | None:
        raw = course.get("instructor_id")
        if raw is None:
            return None
        if isinstance(raw, ObjectId):
            return str(raw)
        return str(raw)

    @staticmethod
    def _dt_iso(value) -> str | None:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat() + ("Z" if value.tzinfo is None else "")
        return str(value)

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

        course_instructor_id = self._instructor_id_str(course)
        if course_instructor_id != instructor_id:
            raise Exception("Unauthorized")

        if course.get("is_locked"):
            raise Exception("Course is locked")

        videos = video_repository.get_by_course(course_id)

        if not videos:
            raise Exception("Course must have at least 1 video")

        if len(course.get("title", "")) < 5:
            raise Exception("Invalid title")

        updated = await course_repository.update(
            course_id,
            {
                "status": "PENDING",
                "is_locked": True,
            },
        )

        if not updated:
            raise Exception("Submit failed")

        return {"message": "Submitted successfully"}

    def _format_pending_row(self, course: dict) -> dict:
        iid = self._instructor_id_str(course)
        instructor_name = "—"
        if iid:
            u = get_user_by_id(iid)
            if u:
                instructor_name = u.get("fullName") or u.get("email") or "—"

        videos = video_repository.get_by_course(course["id"])
        submitted_at = course.get("updated_at") or course.get("created_at")

        thumb = course.get("image") or ""

        return {
            "id": course["id"],
            "title": course.get("title", ""),
            "instructor": instructor_name,
            "submittedAt": self._dt_iso(submitted_at) or "",
            "videoCount": len(videos),
            "thumbnail": thumb,
            "status": self.map_status(course.get("status")),
            "price": course.get("price", 0),
        }

    async def get_pending_courses(self, page=1, limit=10):
        courses = await course_repository.find({"status": "PENDING"}, page, limit)
        total = course_repository.count({"status": "PENDING"})
        return {
            "items": [self._format_pending_row(c) for c in courses],
            "total": total,
            "page": page,
            "limit": limit,
        }

    async def get_admin_course_detail(self, course_id: str):
        course = await course_repository.get_by_id(course_id)
        if not course:
            return None

        iid = self._instructor_id_str(course)
        instructor_name = "—"
        if iid:
            u = get_user_by_id(iid)
            if u:
                instructor_name = u.get("fullName") or u.get("email") or "—"

        raw_videos = video_repository.get_by_course(course_id)
        course_thumb = (course.get("image") or "").strip()
        lessons = []
        for i, v in enumerate(raw_videos):
            vid = str(v["_id"]) if v.get("_id") is not None else f"v{i}"
            raw_url = v.get("url") or ""
            path = v.get("storage_path") or _gcs.object_name_from_public_url(raw_url)
            play_url = ""
            if path:
                try:
                    play_url = _gcs.generate_read_signed_url(path)
                except Exception:
                    play_url = raw_url
            else:
                play_url = raw_url
            lesson_thumb = (v.get("thumbnail_url") or "").strip() or course_thumb
            lessons.append(
                {
                    "id": vid,
                    "title": v.get("title") or v.get("file_name") or f"Bài {i + 1}",
                    "duration": "—",
                    "size": "—",
                    "url": raw_url,
                    "play_url": play_url,
                    "thumbnail_url": lesson_thumb,
                    "description": v.get("description", ""),
                }
            )

        status_raw = course.get("status") or "DRAFT"
        status_ui = {
            "DRAFT": "draft",
            "PENDING": "pending",
            "APPROVED": "published",
            "REJECTED": "rejected",
        }.get(status_raw, "draft")

        updated = course.get("updated_at") or course.get("created_at")

        return {
            "id": course["id"],
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "instructor": instructor_name,
            "category": self._category_display(course.get("category", "")),
            "categoryId": course.get("category", ""),
            "price": float(course.get("price") or 0),
            "status": status_ui,
            "statusRaw": status_raw,
            "thumbnail": course.get("image") or "",
            "rejectReason": course.get("reject_reason", ""),
            "lessons": lessons,
            "has_new_update": False,
            "updatedDate": self._dt_iso(updated) or "",
        }

    async def get_instructor_courses(self, instructor_id: str):
        courses = await course_repository.find_by_instructor(instructor_id)

        result = []

        for c in courses:
            try:
                videos = video_repository.get_by_course(c["id"])
            except Exception:
                videos = []

            result.append(
                {
                    "id": c["id"],
                    "title": c.get("title", ""),
                    "category": c.get("category", ""),
                    "status": self.map_status(c.get("status")),
                    "students": 0,
                    "lessons": len(videos),
                    "price": c.get("price", 0),
                    "image": c.get("image", ""),
                }
            )

        return result

    async def approve_course(self, course_id: str, price: float):
        if price is None or price < 0:
            raise Exception("Invalid price")

        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        if course.get("status") != "PENDING":
            raise Exception("Course is not pending")

        updated = await course_repository.update(
            course_id,
            {
                "status": "APPROVED",
                "price": float(price),
            },
        )

        if not updated:
            raise Exception("Approve failed")

        return {"message": "Approved successfully"}

    async def reject_course(self, course_id: str, reason: str = ""):
        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        if course.get("status") != "PENDING":
            raise Exception("Course is not pending")

        updated = await course_repository.update(
            course_id,
            {
                "status": "REJECTED",
                "reject_reason": reason or "",
                "is_locked": False,
            },
        )

        if not updated:
            raise Exception("Reject failed")

        return {"message": "Rejected successfully"}
