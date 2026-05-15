from bson import ObjectId
from datetime import datetime
from fastapi import HTTPException
import random
import os

from app.database.mongodb import db
from app.modules.payment.vnpay_utils import VNPay
from app.modules.notifications.notification_repository import notification_repository

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

                # Create success notification for learner
                course = db.courses.find_one({"_id": payment["course_id"]})
                course_name = course.get("title", "khóa học") if course else "khóa học"

                notification_repository.create({
                    "user_id": payment["user_id"],
                    "title": "Thanh toán thành công!",
                    "message": f"Bạn đã thanh toán thành công cho khóa học \"{course_name}\". Giờ bạn có thể bắt đầu học ngay!",
                    "type": "payment_success",
                    "course_id": payment["course_id"],
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })

                # Notify instructor about new paid enrollment
                if course and course.get("instructor_id"):
                    student = db.users.find_one({"_id": payment["user_id"]})
                    student_name = student.get("fullName", "Một học viên") if student else "Một học viên"

                    notification_repository.create({
                        "user_id": course["instructor_id"],
                        "title": "Học viên mới đăng ký!",
                        "message": f"{student_name} vừa mua và đăng ký khóa học \"{course_name}\". Chào đón và hỗ trợ họ trong hành trình học tập nhé!",
                        "type": "new_enroll",
                        "course_id": payment["course_id"],
                        "student_id": payment["user_id"],
                        "is_read": False,
                        "created_at": datetime.utcnow()
                    })

                return {"status": "success", "message": "Payment successful"}
            else:
                # Payment failed/canceled
                db.payments.update_one(
                    {"_id": payment["_id"]},
                    {"$set": {"status": "failed"}}
                )

                # Create failed notification
                course = db.courses.find_one({"_id": payment["course_id"]})
                course_name = course.get("title", "khóa học") if course else "khóa học"

                notification_repository.create({
                    "user_id": payment["user_id"],
                    "title": "Thanh toán thất bại",
                    "message": f"Giao dịch thanh toán cho khóa học \"{course_name}\" không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
                    "type": "payment_failed",
                    "course_id": payment["course_id"],
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })

                return {"status": "failed", "message": "Payment failed"}
        else:
            return {"status": "failed", "message": "Invalid signature"}

    # ====================================
    # GET PAYMENT HISTORY
    # ====================================
    async def get_payment_history(self, user_id: str):
        """
        Lấy lịch sử giao dịch của user
        """
        # Get all payments của user, sort theo created_at mới nhất
        # Chỉ lấy success và failed, không lấy pending (giao dịch chưa hoàn thành)
        payments = list(db.payments.find({
            "user_id": ObjectId(user_id),
            "status": {"$in": ["success", "failed"]}  # Loại bỏ pending
        }).sort("created_at", -1))

        result = []

        for payment in payments:
            # Get course info
            course = None
            course_title = "Khóa học"
            course_thumbnail = None

            if payment.get("course_id"):
                course = db.courses.find_one({"_id": payment["course_id"]})
                if course:
                    course_title = course.get("title", "Khóa học")
                    course_thumbnail = course.get("image") or course.get("thumbnail")

            # Format created_at và paid_at thành ISO string
            created_at = payment.get("created_at")
            if created_at and hasattr(created_at, 'isoformat'):
                created_at = created_at.isoformat() + "Z"

            paid_at = payment.get("paid_at")
            if paid_at and hasattr(paid_at, 'isoformat'):
                paid_at = paid_at.isoformat() + "Z"

            result.append({
                "id": str(payment["_id"]),
                "transaction_id": payment.get("transaction_id"),
                "course_id": str(payment["course_id"]) if payment.get("course_id") else None,
                "course_title": course_title,
                "course_thumbnail": course_thumbnail,
                "amount": payment.get("amount", 0),
                "currency": payment.get("currency", "VND"),
                "payment_method": payment.get("payment_method", "vnpay"),
                "status": payment.get("status", "pending"),
                "created_at": created_at,
                "paid_at": paid_at
            })

        # Calculate stats
        total = len(payments)
        success = len([p for p in payments if p.get("status") == "success"])
        pending = len([p for p in payments if p.get("status") == "pending"])
        failed = len([p for p in payments if p.get("status") == "failed"])
        total_amount = sum([p.get("amount", 0) for p in payments if p.get("status") == "success"])

        return {
            "transactions": result,
            "stats": {
                "total": total,
                "success": success,
                "pending": pending,
                "failed": failed,
                "total_amount": total_amount
            }
        }

payment_service = PaymentService()