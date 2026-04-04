from google.cloud import storage

client = storage.Client()

buckets = list(client.list_buckets())

print("=== BUCKET LIST ===")

if not buckets:
    print("No bucket found")
else:
    for bucket in buckets:
        print(bucket.name)