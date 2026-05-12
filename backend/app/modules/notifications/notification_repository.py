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


notification_repository = NotificationRepository()