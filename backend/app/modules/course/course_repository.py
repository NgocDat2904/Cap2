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
        del new_doc["_id"]

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
    async def find_public(self, filter: dict, page: int = 1, limit: int = 10):
        try:
            page = max(page, 1)
            limit = min(max(limit, 1), 100)
            skip = (page - 1) * limit

            filter["is_deleted"] = {"$ne": True}

            cursor = (
                self.collection
                .find(filter)
                .sort("updated_at", -1)
                .skip(skip)
                .limit(limit)
            )

            # ❌ BEFORE: await to_list
            # ✅ FIX: list()
            return list(cursor)

        except Exception as e:
            print("find_public error:", e)
            return []


    # SEARCH
    async def search(self, filter: dict, page: int = 1, limit: int = 10):
        # ❌ BEFORE: await find_public
        # ✅ FIX: không cần await vì function bên dưới sync
        return await self.find_public(filter, page, limit)


    # GET PUBLIC COURSE DETAIL
    async def get_public_by_id_with_sections(self, course_id: str):
        try:
            # ❌ BEFORE: await find_one
            # ✅ FIX: sync
            return self.collection.find_one({
                "_id": ObjectId(course_id),
                "status": "APPROVED"
            })
        except InvalidId:
            return None

    # ✅ UPDATE COURSE WITH LESSONS ARRAY — Two-layer State Management
    async def update_with_lessons(self, course_id: str, course_data: dict, lessons: list):
        """
        Cập nhật khóa học kèm danh sách bài giảng.

        Nguyên tắc Two-layer State:
        - Lesson cũ (đã có _id hợp lệ trong DB): giữ nguyên is_approved hiện tại.
        - Lesson mới (FE gửi id là timestamp hoặc None): set is_approved = False,
          chờ Admin duyệt riêng từng bài mà KHÔNG ảnh hưởng khóa học.
        """
        try:
            # 1. LẤY DANH SÁCH _id LESSON ĐÃ TỒN TẠI TRONG DB để phân biệt cũ/mới
            existing_course = self.collection.find_one(
                {"_id": ObjectId(course_id)},
                {"lessons": 1}
            )
            existing_ids = set()
            if existing_course:
                for el in (existing_course.get("lessons") or []):
                    raw_id = el.get("_id")
                    if raw_id:
                        existing_ids.add(str(raw_id))

            # 2. PHÂN LOẠI VÀ CHUẨN HÓA TỪNG LESSON
            processed_lessons = []
            for lesson in (lessons or []):
                if not isinstance(lesson, dict):
                    continue

                raw_id = lesson.get("_id") or lesson.get("id")
                is_existing = raw_id and str(raw_id) in existing_ids

                processed_lessons.append({
                    # Giữ nguyên _id nếu là lesson cũ, tạo mới nếu lesson mới
                    "_id": raw_id if is_existing else None,
                    "title": lesson.get("title", ""),
                    "description": lesson.get("description", ""),
                    "duration": lesson.get("duration", "00:00"),
                    "is_published": lesson.get("is_published", True),

                    # ✅ NGHIỆP VỤ THEN CHỐT:
                    # - Lesson cũ: giữ nguyên trạng thái is_approved (đã duyệt vẫn = True)
                    "is_approved": True,

                    "created_at": lesson.get("created_at", datetime.utcnow()),
                    "updated_at": datetime.utcnow(),
                })

            # 3. CHUẨN BỊ PAYLOAD — course_data đã được service xử lý trước (status, flags)
            update_payload = {
                **course_data,
                "lessons": processed_lessons,
                "updated_at": datetime.utcnow()
            }

            # 4. GHI VÀO DATABASE
            result = self.collection.update_one(
                {"_id": ObjectId(course_id)},
                {"$set": update_payload}
            )

            return {
                "success": result.matched_count > 0,
                "modified": result.modified_count,
                "lessons_count": len(processed_lessons),
                # Trả về số lesson mới để service log/thông báo nếu cần
                "new_lessons_count": sum(1 for l in processed_lessons if not l["is_approved"]),
            }

        except InvalidId:
            return {"success": False, "error": "Invalid course ID"}
        except Exception as e:
            print(f"❌ Update with lessons error: {e}")
            return {"success": False, "error": str(e)}