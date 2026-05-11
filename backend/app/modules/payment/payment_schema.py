from pydantic import BaseModel


class PaymentRequest(BaseModel):
    course_id: str