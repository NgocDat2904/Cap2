import os
from app.storage.gcs_client import GCSClient
from dotenv import load_dotenv

load_dotenv()

gcs = GCSClient()
if not gcs.client:
    print("GCS Client failed!")
    exit(1)

bucket = gcs.client.bucket(gcs.bucket_name)
target = "videos/d01cc548-2109-45d1-9723-47248f098bd2_test.mp4"
blob = bucket.blob(target)
print(f"File: {target}")
print(f"Exists: {blob.exists()}")

print(f"\nAll files in bucket/videos/:")
blobs = list(bucket.list_blobs(prefix="videos/", max_results=20))
if not blobs:
    print("  (EMPTY - khong co file nao!)")
for b in blobs:
    print(f"  - {b.name}  ({b.size} bytes)")
