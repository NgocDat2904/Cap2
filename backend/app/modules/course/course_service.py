from .course_repository import CourseRepository
from app.modules.video.video_repository import VideoRepository
from bson import ObjectId


course_repository = CourseRepository()
video_repository = VideoRepository()


class CourseService:

    def map_status(self, status: str):
        return {
            "DRAFT": "Draft",
            "PENDING": "Pending",
            "APPROVED": "Published",
            "REJECTED": "Rejected"
        }.get(status, status)


    # 🔥 NEW: CREATE COURSE
    async def create_course(self, data: dict, instructor_id: str):
        if not data.get("title"):
            raise Exception("Title is required")

        if len(data.get("title", "")) < 5:
            raise Exception("Title too short")

        course = {
            "title": data.get("title"),
            "description": data.get("description", ""),
            "category": data.get("category", ""),
            "price": 0,
            "status": "DRAFT",
            "instructor_id": ObjectId(instructor_id),  # 🔥 chuẩn DB
            "is_locked": False
        }

        course_id = await course_repository.create(course)

        return {
            "id": course_id,
            "message": "Course created successfully"
        }


    async def submit_course(self, course_id: str, instructor_id: str):
        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        # 🔥 check trạng thái trước (quan trọng)
        if course.get("status") != "DRAFT":
            raise Exception("Course already submitted")

        # 🔥 FIX ObjectId vs string
        course_instructor_id = course.get("instructor_id")
        if isinstance(course_instructor_id, ObjectId):
            course_instructor_id = str(course_instructor_id)

        if course_instructor_id != instructor_id:
            raise Exception("Unauthorized")

        if course.get("is_locked"):
            raise Exception("Course is locked")

        videos = video_repository.get_by_course(course_id)

        if not videos:
            raise Exception("Course must have at least 1 video")

        if len(course.get("title", "")) < 5:
            raise Exception("Invalid title")

        updated = await course_repository.update(course_id, {
            "status": "PENDING",
            "is_locked": True
        })

        if not updated:
            raise Exception("Submit failed")

        return {"message": "Submitted successfully"}


    async def get_pending_courses(self, page=1, limit=10):
        courses = await course_repository.find({"status": "PENDING"}, page, limit)
        return [self._format_course_basic(c) for c in courses]


    async def get_instructor_courses(self, instructor_id: str):
        courses = await course_repository.find_by_instructor(instructor_id)

        result = []

        for c in courses:
            try:
                videos = video_repository.get_by_course(c["id"])
            except:
                videos = []

            result.append({
                "id": c["id"],
                "title": c.get("title", ""),
                "category": c.get("category", ""),
                "status": self.map_status(c.get("status")),
                "students": 0,
                "lessons": len(videos),
                "price": c.get("price", 0),
                "image": c.get("image", "")
            })

        return result


    async def approve_course(self, course_id: str, price: float):
        if price is None or price <= 0:
            raise Exception("Invalid price")

        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        if course.get("status") != "PENDING":
            raise Exception("Course is not pending")

        updated = await course_repository.update(course_id, {
            "status": "APPROVED",
            "price": price
        })

        if not updated:
            raise Exception("Approve failed")

        return {"message": "Approved successfully"}


    async def reject_course(self, course_id: str, reason: str = ""):
        course = await course_repository.get_by_id(course_id)

        if not course:
            raise Exception("Course not found")

        if course.get("status") != "PENDING":
            raise Exception("Course is not pending")

        updated = await course_repository.update(course_id, {
            "status": "REJECTED",
            "reject_reason": reason,
            "is_locked": False
        })

        if not updated:
            raise Exception("Reject failed")

        return {"message": "Rejected successfully"}


    def _format_course_basic(self, course: dict):
        return {
            "id": course["id"],
            "title": course.get("title", ""),
            "status": self.map_status(course.get("status")),
            "price": course.get("price", 0)
        }