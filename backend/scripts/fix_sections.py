from app.database.mongodb import db

def fix_sections():
    print("🚀 Fix sections per course...")

    courses = db.sections.distinct("course_id")

    for course_id in courses:
        sections = list(
            db.sections.find({"course_id": course_id}).sort("created_at", 1)
        )

        i = 1
        for s in sections:
            db.sections.update_one(
                {"_id": s["_id"]},
                {"$set": {"order_index": i}}
            )
            print(f"{course_id} → {s['_id']} → {i}")
            i += 1

    print("✅ Done!")

if __name__ == "__main__":
    fix_sections()