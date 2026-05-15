from app.database.mongodb import db


class NotificationRepository:

    def create(self, data):
        return db.notifications.insert_one(data)

    def get_user_notifications(self, user_id):

        return list(
            db.notifications
            .find({
                "user_id": user_id
            })
            .sort("created_at", -1)
        )

    def mark_as_read(self, notification_id):

        db.notifications.update_one(
            {
                "_id": notification_id
            },
            {
                "$set": {
                    "is_read": True
                }
            }
        )

    def delete_notification(self, notification_id, user_id):
        """
        Xóa thông báo (chỉ cho phép user xóa thông báo của chính họ)
        """
        result = db.notifications.delete_one(
            {
                "_id": notification_id,
                "user_id": user_id
            }
        )
        return result.deleted_count > 0


notification_repository = NotificationRepository()