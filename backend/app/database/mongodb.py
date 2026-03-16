from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017/"

client = MongoClient(MONGO_URL)

print("Connected to MongoDB")

db = client["edusyncDB"]