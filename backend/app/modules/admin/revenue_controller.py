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
