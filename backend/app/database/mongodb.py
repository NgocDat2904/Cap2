from pymongo import MongoClient
import certifi
import os

MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb+srv://admin:123456aA.@cluster0.sivzwjm.mongodb.net/?appName=Cluster0",
)

client = MongoClient(
    MONGO_URL,
    tls=True,
    tlsCAFile=certifi.where(),
    connect=False,
    serverSelectionTimeoutMS=5000,
)

print("MongoDB client initialized (lazy connect)")

db = client["edusyncDB"]