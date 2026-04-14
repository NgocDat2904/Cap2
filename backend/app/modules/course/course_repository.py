from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from app.database.mongodb import db


class CourseRepository:
    def __init__(self):
        self.collection = db.courses

    # ===================== UTILS =====================

    def _convert_id(self, doc):
        if not doc:
            return None

        new_doc = dict(doc)
        new_doc["id"] = str(new_doc["_id"])
        del new_doc["_id"]

        return new_doc

    def _convert_list(self, docs):
        return [self._convert_id(doc) for doc in docs]

    # ===================== CRUD =====================

    async def get_by_id(self, course_id: str):
        try:
            course = self.collection.find_one(
                {"_id": ObjectId(course_id)}
            )
            return self._convert_id(course)
        except InvalidId:
            return None

    async def get_public_by_id(self, course_id: str):
        try:
            course = self.collection.find_one(
                {
                    "_id": ObjectId(course_id),
                    "status": "APPROVED",
                }
            )
            return self._convert_id(course)
        except InvalidId:
            return None

    # ===================== 🔥 MAIN AGGREGATION =====================

    async def get_public_by_id_with_sections(self, course_id: str):
        try:
            pipeline = [
                {
                    "$match": {
                        "_id": ObjectId(course_id),
                        "status": "APPROVED"
                    }
                },
                {
                    "$lookup": {
                        "from": "sections",
                        "let": {"courseId": "$_id"},
                        "pipeline": [
                            {
                                "$match": {
                                    "$expr": {
                                        "$eq": ["$course_id", "$$courseId"]
                                    }
                                }
                            },
                            {
                                "$lookup": {
                                    "from": "lessons",
                                    "localField": "_id",
                                    "foreignField": "section_id",
                                    "as": "lessons"
                                }
                            },
                            {
                                "$sort": {"created_at": 1}
                            }
                        ],
                        "as": "sections"
                    }
                }
            ]

            result = list(self.collection.aggregate(pipeline))

            if not result:
                return None

            return result[0]

        except InvalidId:
            return None
        except Exception as e:
            print("❌ Aggregation error:", e)
            return None

    # ===================== CREATE / UPDATE =====================

    async def create(self, data: dict):
        now = datetime.utcnow()

        payload = {
            **data,
            "created_at": now,
            "updated_at": now,
        }

        result = self.collection.insert_one(payload)
        return str(result.inserted_id)

    async def update(self, course_id: str, data: dict):
        try:
            result = self.collection.update_one(
                {"_id": ObjectId(course_id)},
                {
                    "$set": {
                        **data,
                        "updated_at": datetime.utcnow(),
                    }
                },
            )
            return result.modified_count > 0
        except InvalidId:
            return False

    # ===================== QUERY =====================

    async def find(self, filter: dict, page: int = 1, limit: int = 10):
        try:
            page = max(page, 1)
            limit = min(max(limit, 1), 100)

            skip = (page - 1) * limit

            cursor = (
                self.collection
                .find(filter)
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )

            return self._convert_list(list(cursor))

        except Exception as e:
            print("❌ Find error:", e)
            return []

    def find_public(self, filter: dict, page: int = 1, limit: int = 10):
        try:
            page = max(page, 1)
            limit = min(max(limit, 1), 100)

            skip = (page - 1) * limit

            cursor = (
                self.collection
                .find(
                    filter,
                    {
                        "title": 1,
                        "category": 1,
                        "price": 1,
                        "image": 1,
                        "status": 1,
                        "created_at": 1,
                    },
                )
                .sort("created_at", -1)
                .skip(skip)
                .limit(limit)
            )

            return self._convert_list(list(cursor))

        except Exception as e:
            print("❌ Find public error:", e)
            return []

    def search(self, filter: dict, page: int = 1, limit: int = 10):
        try:
            page = max(page, 1)
            limit = min(max(limit, 1), 100)

            skip = (page - 1) * limit

            cursor = (
                self.collection
                .find(
                    filter,
                    {
                        "title": 1,
                        "category": 1,
                        "price": 1,
                        "image": 1,
                        "status": 1,
                        "score": {"$meta": "textScore"},
                    },
                )
                .sort([("score", {"$meta": "textScore"})])
                .skip(skip)
                .limit(limit)
            )

            return self._convert_list(list(cursor))

        except Exception as e:
            print("❌ Search error:", e)
            return []

    async def find_by_instructor(self, instructor_id: str):
        try:
            cursor = self.collection.find({
                "instructor_id": ObjectId(instructor_id)
            })

            return self._convert_list(list(cursor))

        except (InvalidId, Exception) as e:
            print("Find by instructor error:", e)
            return []

    # ===================== COUNT =====================

    def count(self, filter: dict) -> int:
        try:
            return self.collection.count_documents(filter)
        except Exception as e:
            print("Count error:", e)
            return 0