"""
Migration: Add 'lessons' field to existing courses
Fixes: "The path 'lessons' must exist in the document in order to apply array updates"
Date: 2025-01-XX
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

def migrate():
    client = MongoClient(MONGO_URL)
    db = client.get_database()

    # Find all courses without 'lessons' field
    result = db.courses.update_many(
        {
            "lessons": {"$exists": False}
        },
        {
            "$set": {"lessons": []}
        }
    )

    print(f"✅ Migration completed:")
    print(f"   - Matched: {result.matched_count} documents")
    print(f"   - Modified: {result.modified_count} documents")

    client.close()

if __name__ == "__main__":
    print("🚀 Running migration: Add 'lessons' field to courses...")
    migrate()
    print("✅ Done!")
