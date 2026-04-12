# ===================== COMMON =====================

def _category_display(self, cat_id: str):
    if not cat_id:
        return "—"
    return _CATEGORY_LABELS.get(cat_id, cat_id)


@staticmethod
def _instructor_id_str(course: dict):
    raw = course.get("instructor_id")
    return str(raw) if raw else None


@staticmethod
def _dt_iso(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value) if value else None


# ===================== 🆕 PUBLIC =====================

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
    course = await course_repository.get_public_by_id(course_id)

    if not course:
        return None

    raw_videos = video_repository.get_by_course(course_id)
    course_thumb = (course.get("image") or "").strip()

    lessons = []
    for i, v in enumerate(raw_videos):
        raw_url = v.get("url") or ""
        path = v.get("storage_path") or _gcs.object_name_from_public_url(raw_url)

        if path:
            try:
                play_url = _gcs.generate_read_signed_url(path)
            except Exception:
                play_url = raw_url
        else:
            play_url = raw_url

        lessons.append({
            "id": str(v.get("_id", f"v{i}")),
            "title": v.get("title") or v.get("file_name") or f"Bài {i+1}",
            "play_url": play_url,
            "thumbnail_url": (v.get("thumbnail_url") or "").strip() or course_thumb,
        })

    return {
        "id": course["id"],
        "title": course.get("title", ""),
        "description": course.get("description", ""),
        "category": self._category_display(course.get("category")),
        "price": float(course.get("price") or 0),
        "thumbnail": course_thumb,
        "lessons": lessons,
    }


# ===================== 🆕 SEARCH =====================

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


# ===================== ADMIN =====================

def _format_pending_row(self, course: dict):
    iid = self._instructor_id_str(course)
    instructor_name = "—"

    if iid:
        u = get_user_by_id(iid)
        if u:
            instructor_name = u.get("fullName") or u.get("email") or "—"

    videos = video_repository.get_by_course(course["id"])
    submitted_at = course.get("updated_at") or course.get("created_at")

    return {
        "id": course["id"],
        "title": course.get("title", ""),
        "instructor": instructor_name,
        "submittedAt": self._dt_iso(submitted_at) or "",
        "videoCount": len(videos),
        "thumbnail": course.get("image") or "",
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
        raw_url = v.get("url") or ""
        path = v.get("storage_path") or _gcs.object_name_from_public_url(raw_url)

        if path:
            try:
                play_url = _gcs.generate_read_signed_url(path)
            except Exception:
                play_url = raw_url
        else:
            play_url = raw_url

        lessons.append({
            "id": str(v.get("_id", f"v{i}")),
            "title": v.get("title") or v.get("file_name") or f"Bài {i+1}",
            "url": raw_url,
            "play_url": play_url,
            "thumbnail_url": (v.get("thumbnail_url") or "").strip() or course_thumb,
            "description": v.get("description", ""),
        })

    return {
        "id": course["id"],
        "title": course.get("title", ""),
        "description": course.get("description", ""),
        "instructor": instructor_name,
        "category": self._category_display(course.get("category")),
        "price": float(course.get("price") or 0),
        "status": course.get("status"),
        "thumbnail": course.get("image") or "",
        "rejectReason": course.get("reject_reason", ""),
        "lessons": lessons,
        "updatedDate": self._dt_iso(course.get("updated_at")),
    }


async def approve_course(self, course_id: str, price: float):
    course = await course_repository.get_by_id(course_id)

    if not course:
        raise Exception("Course not found")

    if course.get("status") != "PENDING":
        raise Exception("Course is not pending")

    await course_repository.update(course_id, {
        "status": "APPROVED",
        "price": float(price),
    })

    return {"message": "Approved successfully"}


async def reject_course(self, course_id: str, reason: str = ""):
    course = await course_repository.get_by_id(course_id)

    if not course:
        raise Exception("Course not found")

    if course.get("status") != "PENDING":
        raise Exception("Course is not pending")

    await course_repository.update(course_id, {
        "status": "REJECTED",
        "reject_reason": reason,
        "is_locked": False,
    })

    return {"message": "Rejected successfully"}