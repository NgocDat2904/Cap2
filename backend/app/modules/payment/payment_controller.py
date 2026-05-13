from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
import os

from app.modules.payment.payment_schema import (
    PaymentRequest
)

from app.modules.payment.payment_service import (
    payment_service
)

from app.middleware.auth_middleware import (
    require_role
)

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.post("/create")
async def create_payment(
    request: Request,
    data: PaymentRequest,
    current_user=Depends(
        require_role(["learner"])
    )
):
    # Get client IP for VNPAY
    ip_addr = request.client.host if request.client else "127.0.0.1"

    return await payment_service.create_payment(
        course_id=data.course_id,
        user_id=current_user["id"],
        ip_addr=ip_addr
    )


@router.get("/vnpay_return")
async def vnpay_return(request: Request):
    query_params = dict(request.query_params)
    
    result = await payment_service.process_vnpay_return(query_params)
    
    status = result.get("status", "failed")
    
    # Redirect to frontend payment result page
    redirect_url = f"{FRONTEND_URL}/payment-result?status={status}"
    
    return RedirectResponse(url=redirect_url)