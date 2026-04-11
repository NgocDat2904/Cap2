from pymongo import MongoClient
import certifi

MONGO_URL = "mongodb+srv://edusync_db_new:123456aA@cluster0.viv2auh.mongodb.net/?appName=Cluster0"

client = MongoClient(
    MONGO_URL,
    tls=True,
    tlsCAFile=certifi.where()
)

try:
    client.admin.command("ping")
    print("✅ Connected to MongoDB")
except Exception as e:
    print("❌ MongoDB connection error:", e)

db = client["edusync_db"]

print("🔥 CONNECT DB:", db.name)
print("🔥 COLLECTIONS:", db.list_collection_names())