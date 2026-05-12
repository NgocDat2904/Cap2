from bson import ObjectId

from app.database.mongodb import db

from .notification_repository import (
    notification_repository
)


class NotificationService:

    async def get_my_notifications(
        self,
        user_id
    ):

        notifications = (
            notification_repository
            .get_user_notifications(
                ObjectId(user_id)
            )
        )

        result = []

        for n in notifications:

            result.append({

                "id": str(n["_id"]),

                "title": n.get("title"),

                "message": n.get("message"),

                "type": n.get("type"),

                "is_read": n.get("is_read", False),

                "created_at": n.get("created_at"),

                "course_id": str(n["course_id"])
                if n.get("course_id")
                else None,

                "question_id": str(n["question_id"])
                if n.get("question_id")
                else None
            })

        return result


notification_service = NotificationService()