from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
import random
import os

from app.database.mongodb import db
from app.modules.payment.vnpay_utils import VNPay

# Get VNPay config from env or use defaults (sandbox)
VNPAY_TMN_CODE = os.getenv("VNPAY_TMN_CODE", "CGXZLS0Z")
VNPAY_HASH_SECRET = os.getenv("VNPAY_HASH_SECRET", "XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN")
VNPAY_PAYMENT_URL = os.getenv("VNPAY_PAYMENT_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
VNPAY_RETURN_URL = os.getenv("VNPAY_RETURN_URL", "http://localhost:8000/payments/vnpay_return")

class PaymentService:

    # ====================================
    # CREATE PAYMENT
    # ====================================
    async def create_payment(
        self,
        course_id: str,
        user_id: str,
        ip_addr: str = "127.0.0.1"
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
        # CREATE PENDING PAYMENT
        # ====================================
        amount = float(course.get("price", 0))
        # If the amount is 0, the user shouldn't be here, they should use the enroll API directly
        # but just in case:
        if amount == 0:
            raise HTTPException(
                status_code=400,
                detail="Free course, please use enroll API"
            )

        transaction_id = f"{int(datetime.utcnow().timestamp())}{random.randint(100, 999)}"

        payment = {
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id),
            "amount": amount,
            "currency": "VND",
            "payment_method": "vnpay",
            "status": "pending",
            "transaction_id": transaction_id,
            "created_at": datetime.utcnow()
        }

        result = db.payments.insert_one(payment)

        # ====================================
        # GENERATE VNPAY URL
        # ====================================
        vnp = VNPay(
            tmn_code=VNPAY_TMN_CODE,
            hash_secret=VNPAY_HASH_SECRET,
            payment_url=VNPAY_PAYMENT_URL,
            return_url=VNPAY_RETURN_URL
        )

        create_date = datetime.now().strftime('%Y%m%d%H%M%S')
        order_desc = f"Thanh toan khoa hoc {course_id}"
        
        checkout_url = vnp.get_payment_url(
            order_id=transaction_id,
            amount=amount,
            order_desc=order_desc,
            ip_addr=ip_addr,
            create_date=create_date
        )

        # ====================================
        # RESPONSE
        # ====================================
        return {
            "message": "Payment url generated",
            "payment_id": str(result.inserted_id),
            "transaction_id": transaction_id,
            "checkout_url": checkout_url
        }

    # ====================================
    # PROCESS VNPAY RETURN
    # ====================================
    async def process_vnpay_return(self, query_params: dict):
        vnp = VNPay(
            tmn_code=VNPAY_TMN_CODE,
            hash_secret=VNPAY_HASH_SECRET,
            payment_url=VNPAY_PAYMENT_URL,
            return_url=VNPAY_RETURN_URL
        )

        if vnp.validate_response(query_params.copy()):
            transaction_id = query_params.get("vnp_TxnRef")
            response_code = query_params.get("vnp_ResponseCode")

            payment = db.payments.find_one({"transaction_id": transaction_id})
            
            if not payment:
                return {"status": "failed", "message": "Payment not found"}
            
            if payment.get("status") == "success":
                return {"status": "success", "message": "Already paid"}

            if response_code == "00":
                # Payment success
                db.payments.update_one(
                    {"_id": payment["_id"]},
                    {"$set": {"status": "success", "paid_at": datetime.utcnow()}}
                )
                
                # Auto enroll
                db.enrollments.insert_one({
                    "course_id": payment["course_id"],
                    "user_id": payment["user_id"],
                    "created_at": datetime.utcnow(),
                    "last_accessed_at": None
                })
                
                return {"status": "success", "message": "Payment successful"}
            else:
                # Payment failed/canceled
                db.payments.update_one(
                    {"_id": payment["_id"]},
                    {"$set": {"status": "failed"}}
                )
                return {"status": "failed", "message": "Payment failed"}
        else:
            return {"status": "failed", "message": "Invalid signature"}

payment_service = PaymentService()