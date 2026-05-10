from app.database.mongodb import db
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime


class CourseRepository:

    def __init__(self):
        self.collection = db.courses


    # SAFE convert (không mutate object gốc)
    def _convert_id(self, doc):
        if not doc:
            return None

        new_doc = dict(doc)
        new_doc["id"] = str(new_doc["_id"])
        new_doc["_id"] = str(new_doc["_id"])  # 🔥 FIX

        return new_doc


    def _convert_list(self, docs):
        return [self._convert_id(doc) for doc in docs]


    # GET BY ID
    async def get_by_id(self, course_id: str):
        try:
            # ❌ BEFORE: await find_one (Motor style)
            # ✅ FIX: PyMongo là sync → bỏ await
            course = self.collection.find_one({"_id": ObjectId(course_id)})
            return self._convert_id(course)
        except InvalidId:
            return None


    # CREATE COURSE
    async def create(self, data: dict):
        data["created_at"] = datetime.utcnow()
        data["updated_at"] = datetime.utcnow()

        # ❌ BEFORE: await insert_one → gây lỗi InsertOneResult
        # ✅ FIX: dùng sync insert_one
        result = self.collection.insert_one(data)

        return str(result.inserted_id)


    # UPDATE
    async def update(self, course_id: str, data: dict):
        try:
            # ❌ BEFORE: await update_one
            # ✅ FIX: dùng sync
            result = self.collection.update_one(
                {"_id": ObjectId(course_id)},
                {
                    "$set": {
                        **data,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except InvalidId:
            return False


    # FIND WITH PAGINATION
    async def find(self, filter: dict, page: int = 1, limit: int = 10):
        try:
            page = max(page, 1)
            limit = min(max(limit, 1), 100)

            skip = (page - 1) * limit

            # ✅ FIX Ở ĐÂY
            filter["is_deleted"] = {"$ne": True}

            cursor = (
                self.collection
                .find(filter)
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )

            # ❌ BEFORE: await cursor.to_list() (Motor)
            # ✅ FIX: PyMongo → dùng list()
            courses = list(cursor)

            return self._convert_list(courses)

        except Exception as e:
            print("❌ Find error:", e)
            return []


    # FIND BY INSTRUCTOR
    async def find_by_instructor(self, instructor_id: str):
        try:
            obj_id = ObjectId(instructor_id)

            cursor = self.collection.find({
                "instructor_id": obj_id,
                "is_deleted": {"$ne": True} 
            })

            # ❌ BEFORE: await cursor.to_list()
            # ✅ FIX: dùng list()
            courses = list(cursor)

            return self._convert_list(courses)

        except InvalidId:
            return []

        except Exception as e:
            print("Find by instructor error:", e)
            return []


    # COUNT
    async def count(self, filter: dict) -> int:
        try:
            # ❌ BEFORE: await count_documents
            # ✅ FIX: sync
            return self.collection.count_documents(filter)
        except Exception as e:
            print("Count error:", e)
            return 0


    # FIND PUBLIC
    async def find_public(self, filter, page, limit, sort_option):
        try:
            page = max(page, 1)
            limit = min(max(limit, 1), 100)

            skip = (page - 1) * limit

        # tránh lấy course đã xoá
            filter["is_deleted"] = {"$ne": True}

            cursor = (
            self.collection
            .find(filter)
            .sort(sort_option or [("created_at", -1)])
            .skip(skip)
            .limit(limit)
        )

        # ✅ FIX QUAN TRỌNG: dùng list()
            courses = list(cursor)

            return self._convert_list(courses)

        except Exception as e:
            print("❌ find_public error:", e)
            return []


    # SEARCH
    async def search(self, filter: dict, page: int = 1, limit: int = 10):
        # ❌ BEFORE: await find_public
        # ✅ FIX: không cần await vì function bên dưới sync
        return await self.find_public(filter, page, limit, [("created_at", -1)])


    # GET PUBLIC COURSE DETAIL
    async def get_public_by_id(self, course_id: str):
        try:
            return self.collection.find_one({
                "_id": ObjectId(course_id),
                "status": "APPROVED",
                "is_deleted": {"$ne": True}
        })
        except InvalidId:
           return None
        
    async def search_with_sort(self, filter, sort, page=1, limit=10):
        try:
            page = max(page, 1)
            limit = min(max(limit, 1), 100)

            skip = (page - 1) * limit

            filter["is_deleted"] = {"$ne": True}

            cursor = (
            self.collection
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
        )

            return self._convert_list(list(cursor))

        except Exception as e:
            print("❌ search_with_sort error:", e)
            return []

    async def update_with_lessons(self, course_id: str, data: dict, lessons):
        try:
            course_obj_id = ObjectId(course_id)
        except InvalidId:
            return {"success": False, "error": "Invalid course_id"}

        clean_data = {
            k: v
            for k, v in (data or {}).items()
            if v is not None
        }
        clean_data["updated_at"] = datetime.utcnow()

        update_result = self.collection.update_one(
            {"_id": course_obj_id, "is_deleted": {"$ne": True}},
            {"$set": clean_data},
        )
        if update_result.matched_count == 0:
            return {"success": False, "error": "Course not found"}

        lessons_count = 0
        new_lessons_count = 0

        if isinstance(lessons, list):
            for index, lesson in enumerate(lessons):
                if not isinstance(lesson, dict):
                    continue

                lesson_title = (lesson.get("title") or "").strip()
                if not lesson_title:
                    continue

                lesson_update = {
                    "title": lesson_title,
                    "description": (lesson.get("description") or "").strip(),
                    "order_index": lesson.get("order_index", index + 1),
                    "updated_at": datetime.utcnow(),
                }

                lesson_id = lesson.get("id") or lesson.get("_id")
                if lesson_id and ObjectId.is_valid(str(lesson_id)):
                    lesson_result = db.lessons.update_one(
                        {"_id": ObjectId(str(lesson_id)), "course_id": course_obj_id},
                        {"$set": lesson_update},
                    )
                    if lesson_result.matched_count:
                        lessons_count += 1
                        continue

                db.lessons.insert_one(
                    {
                        "course_id": course_obj_id,
                        **lesson_update,
                        "created_at": datetime.utcnow(),
                    }
                )
                lessons_count += 1
                new_lessons_count += 1

        return {
            "success": True,
            "lessons_count": lessons_count,
            "new_lessons_count": new_lessons_count,
        }
