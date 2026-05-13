from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
import random

from app.database.mongodb import db


class PaymentService:

    # ====================================
    # CREATE PAYMENT
    # ====================================
    async def create_payment(
        self,
        course_id: str,
        user_id: str
    ):

        # ====================================
        # CHECK COURSE
        # ====================================

        course = db.courses.find_one({
            "_id": ObjectId(course_id)
        })

        if not course:

            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        # ====================================
        # CHECK ENROLLED
        # ====================================

        enrolled = db.enrollments.find_one({

            "course_id": ObjectId(course_id),

            "user_id": ObjectId(user_id)
        })

        if enrolled:

            raise HTTPException(
                status_code=400,
                detail="Already enrolled"
            )

        # ====================================
        # MOCK PAYMENT
        # ====================================

        transaction_id = (
            f"MOCK_{random.randint(100000, 999999)}"
        )

        payment = {

            "user_id": ObjectId(user_id),

            "course_id": ObjectId(course_id),

            "amount": course.get("price", 0),

            "currency": "VND",

            "payment_method": "mock",

            "status": "success",

            "transaction_id": transaction_id,

            "created_at": datetime.utcnow(),

            "paid_at": datetime.utcnow()
        }

        result = db.payments.insert_one(
            payment
        )

        # ====================================
        # AUTO ENROLL
        # ====================================

        db.enrollments.insert_one({

            "course_id": ObjectId(course_id),

            "user_id": ObjectId(user_id),

            "created_at": datetime.utcnow(),

            "last_accessed_at": None
        })

        # ====================================
        # RESPONSE
        # ====================================

        return {

            "message": "Payment successful",

            "payment_id": str(
                result.inserted_id
            ),

            "transaction_id": transaction_id
        }


payment_service = PaymentService()