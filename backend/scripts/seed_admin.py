import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.modules.auth.auth_repository import create_user, get_user_by_email
from app.utils.password import hash_password


def seed_admin():
    admin_email = "admin@edusync.com"
    admin_password = "123456"

    existing = get_user_by_email(admin_email)

    if existing:
        print("⚠️ Admin already exists")
        return

    hashed_password = hash_password(admin_password)

    admin_user = {
        "name": "Super Admin",
        "email": admin_email,
        "password": hashed_password,
        "role": "admin"
    }

    create_user(admin_user)

    print(" Admin account created successfully!")


if __name__ == "__main__":
    seed_admin()