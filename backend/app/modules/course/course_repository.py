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


# 🔥 PUBLIC COURSES
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


# 🔥 SEARCH
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


# 🔥 FIND BY INSTRUCTOR (FIX CHUẨN)
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