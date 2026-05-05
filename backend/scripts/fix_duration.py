import os
import cv2
from bson import ObjectId

from app.database.mongodb import db
from app.storage.gcs_client import GCSClient   # 👈 chỉnh path nếu khác

gcs_client = GCSClient()


def seconds_to_mmss(seconds):
    m = seconds // 60
    s = seconds % 60
    return f"{m}:{str(s).zfill(2)}"


def fix_all_video_duration():
    videos = list(db.videos.find({}))

    print(f"🔥 Found {len(videos)} videos")

    for v in videos:
        storage_path = v.get("storage_path")

        if not storage_path:
            print("⚠️ Skip (no storage_path):", v["_id"])
            continue

        try:
            bucket = gcs_client.client.bucket(gcs_client.bucket_name)
            blob = bucket.blob(storage_path)

            temp_file = f"temp_{ObjectId()}.mp4"
            blob.download_to_filename(temp_file)

            video = cv2.VideoCapture(temp_file)
            fps = video.get(cv2.CAP_PROP_FPS)
            frame_count = video.get(cv2.CAP_PROP_FRAME_COUNT)

            seconds = int(frame_count / fps) if fps else 0
            duration = seconds_to_mmss(seconds)

            db.videos.update_one(
                {"_id": v["_id"]},
                {"$set": {"duration": duration}}
            )

            print("✅ Updated:", v["_id"], duration)

            video.release()

            if os.path.exists(temp_file):
                os.remove(temp_file)

        except Exception as e:
            print("❌ Error:", v["_id"], str(e))


if __name__ == "__main__":
    fix_all_video_duration()