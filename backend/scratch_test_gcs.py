import os
from app.storage.gcs_client import GCSClient
from dotenv import load_dotenv

# Load .env
load_dotenv()

print("--- Testing GCS Initialization ---")
try:
    gcs = GCSClient()
    if gcs.client:
        print("SUCCESS: GCS Client initialized successfully.")
    else:
        print(" FAILURE: GCS Client failed to initialize.")
except Exception as e:
    print(f"ERROR: {e}")
