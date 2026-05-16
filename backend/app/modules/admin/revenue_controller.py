from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from app.middleware.auth_middleware import require_role
from app.modules.admin.revenue_service import revenue_service

router = APIRouter(prefix="/admin/revenue", tags=["Admin Revenue"])

@router.get("/stats")
async def get_revenue_stats(
    year: int = Query(2026, ge=2020, le=2030),
    user=Depends(require_role(["admin"]))
):
    """
    Lấy thống kê tổng quan doanh thu theo năm
    """
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31, 23, 59, 59)

    return revenue_service.get_revenue_stats(start_date, end_date)

@router.get("/chart")
async def get_revenue_chart(
    year: int = Query(2026, ge=2020, le=2030),
    user=Depends(require_role(["admin"]))
):
    """
    Lấy dữ liệu biểu đồ doanh thu theo năm
    """
    return revenue_service.get_revenue_by_year(year)

@router.get("/top-courses")
async def get_top_courses(
    limit: int = Query(10, ge=1, le=50),
    user=Depends(require_role(["admin"]))
):
    """
    Lấy top khóa học doanh thu cao nhất
    """
    return revenue_service.get_top_revenue_courses(limit)

@router.get("/students-chart")
async def get_students_chart(
    year: int = Query(2026, ge=2020, le=2030),
    user=Depends(require_role(["admin"]))
):
    """
    Lấy dữ liệu biểu đồ students theo năm
    """
    return revenue_service.get_student_stats_by_year(year)

@router.get("/enrollments-debug")
async def debug_enrollments(
    user=Depends(require_role(["admin"]))
):
    """
    DEBUG: Kiểm tra dữ liệu enrollments
    """
    from app.database.mongodb import db
    
    total_count = db.enrollments.count_documents({})
    sample = list(db.enrollments.find({}).limit(5))
    
    # Xóa ObjectId để serialize
    for doc in sample:
        doc["_id"] = str(doc["_id"])
        if "user_id" in doc:
            doc["user_id"] = str(doc["user_id"])
        if "course_id" in doc:
            doc["course_id"] = str(doc["course_id"])
        # Kiểm tra loại created_at
        if "created_at" in doc:
            doc["created_at_type"] = str(type(doc["created_at"]))
            doc["created_at"] = str(doc["created_at"])
    
    return {
        "total_enrollments": total_count,
        "sample_data": sample
    }

@router.get("/students-stats-debug")
async def debug_students_stats(
    year: int = Query(2026, ge=2020, le=2030),
    user=Depends(require_role(["admin"]))
):
    """
    DEBUG: Kiểm tra get_student_stats_by_year
    """
    from app.database.mongodb import db
    from datetime import datetime
    
    start_date = datetime(year, 1, 1)
    end_date = datetime(year, 12, 31, 23, 59, 59)
    
    enrollments = list(db.enrollments.find({
        "created_at": {
            "$gte": start_date.isoformat(),
            "$lte": end_date.isoformat()
        }
    }))
    
    result = revenue_service.get_student_stats_by_year(year)
    
    return {
        "enrollments_matched": len(enrollments),
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "stats_result": result,
        "sample_matched": [
            {
                "created_at": str(e.get("created_at")),
                "user_id": str(e.get("user_id"))
            } for e in enrollments[:3]
        ] if enrollments else []
    }
