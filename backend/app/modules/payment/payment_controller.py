from fastapi import APIRouter, Depends

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


@router.post("/create")
async def create_payment(
    data: PaymentRequest,
    current_user=Depends(
        require_role(["learner"])
    )
):

    return await payment_service.create_payment(

        course_id=data.course_id,

        user_id=current_user["id"]
    )