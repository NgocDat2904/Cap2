from datetime import datetime, timedelta
from bson import ObjectId
from app.database.mongodb import db

class RevenueService:

    def get_revenue_stats(self, start_date=None, end_date=None):
        """
        Lấy thống kê tổng quan doanh thu
        """
        match_query = {"status": "success"}

        if start_date and end_date:
            match_query["paid_at"] = {
                "$gte": start_date,
                "$lte": end_date
            }

        # Pipeline aggregation
        pipeline = [
            {"$match": match_query},
            {"$group": {
                "_id": None,
                "total_revenue": {"$sum": "$amount"},
                "total_sales": {"$sum": 1},
                "unique_users": {"$addToSet": "$user_id"}
            }},
            {"$project": {
                "_id": 0,
                "total_revenue": 1,
                "total_sales": 1,
                "active_learners": {"$size": "$unique_users"}
            }}
        ]

        result = list(db.payments.aggregate(pipeline))

        if not result:
            return {
                "total_revenue": 0,
                "total_sales": 0,
                "active_learners": 0,
                "growth": 0
            }

        stats = result[0]

        # Tính growth (so với kỳ trước)
        growth = 0
        if start_date and end_date:
            period_days = (end_date - start_date).days
            prev_start = start_date - timedelta(days=period_days)
            prev_end = start_date

            prev_pipeline = [
                {
                    "$match": {
                        "status": "success",
                        "paid_at": {"$gte": prev_start, "$lt": prev_end}
                    }
                },
                {"$group": {"_id": None, "prev_revenue": {"$sum": "$amount"}}}
            ]

            prev_result = list(db.payments.aggregate(prev_pipeline))
            if prev_result and prev_result[0]["prev_revenue"] > 0:
                prev_revenue = prev_result[0]["prev_revenue"]
                growth = ((stats["total_revenue"] - prev_revenue) / prev_revenue) * 100

        stats["growth"] = round(growth, 1)

        return stats

    def get_revenue_by_year(self, year=2026):
        """
        Lấy doanh thu theo từng tháng trong năm
        """
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23, 59, 59)

        pipeline = [
            {
                "$match": {
                    "status": "success",
                    "paid_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "month": {"$month": "$paid_at"}
                    },
                    "revenue": {"$sum": "$amount"},
                    "sales": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id.month": 1}
            }
        ]

        results = list(db.payments.aggregate(pipeline))

        # Tạo data cho 12 tháng (bổ sung tháng thiếu với giá trị 0)
        chart_data = []
        results_dict = {r['_id']['month']: r for r in results}

        for month in range(1, 13):
            if month in results_dict:
                r = results_dict[month]
                chart_data.append({
                    "month": f"Th{month:02d}",
                    "revenue": r["revenue"],
                    "sales": r["sales"]
                })
            else:
                chart_data.append({
                    "month": f"Th{month:02d}",
                    "revenue": 0,
                    "sales": 0
                })

        return chart_data

    def get_top_revenue_courses(self, limit=10):
        """
        Lấy top khóa học có doanh thu cao nhất
        """
        pipeline = [
            {"$match": {"status": "success"}},
            {
                "$group": {
                    "_id": "$course_id",
                    "total_revenue": {"$sum": "$amount"},
                    "sales": {"$sum": 1}
                }
            },
            {"$sort": {"total_revenue": -1}},
            {"$limit": limit},
            {
                "$lookup": {
                    "from": "courses",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "course"
                }
            },
            {"$unwind": "$course"},
            {
                "$lookup": {
                    "from": "users",
                    "localField": "course.instructor_id",
                    "foreignField": "_id",
                    "as": "instructor"
                }
            },
            {
                "$unwind": {
                    "path": "$instructor",
                    "preserveNullAndEmptyArrays": True
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "id": {"$toString": "$_id"},
                    "title": "$course.title",
                    "thumbnail": "$course.image",
                    "price": "$course.price",
                    "instructor": {"$ifNull": ["$instructor.fullName", "Unknown"]},
                    "sales": 1,
                    "total_revenue": "$total_revenue"
                }
            }
        ]

        return list(db.payments.aggregate(pipeline))

    def get_student_stats_by_year(self, year=2026):
        """
        Lấy thống kê students theo tháng trong năm
        """
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23, 59, 59)

        # Get all successful payments in period
        pipeline = [
            {
                "$match": {
                    "status": "success",
                    "paid_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "month": {"$month": "$paid_at"},
                        "user_id": "$user_id"
                    },
                    "first_purchase": {"$min": "$paid_at"}
                }
            },
            {
                "$group": {
                    "_id": {
                        "month": "$_id.month"
                    },
                    "students": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id.month": 1}
            }
        ]

        results = list(db.payments.aggregate(pipeline))

        # Tạo data cho 12 tháng (bổ sung tháng thiếu với giá trị 0)
        chart_data = []
        results_dict = {r['_id']['month']: r for r in results}

        for month in range(1, 13):
            if month in results_dict:
                r = results_dict[month]
                chart_data.append({
                    "month": f"Th{month:02d}",
                    "students": r["students"]
                })
            else:
                chart_data.append({
                    "month": f"Th{month:02d}",
                    "students": 0
                })

        return chart_data

revenue_service = RevenueService()
