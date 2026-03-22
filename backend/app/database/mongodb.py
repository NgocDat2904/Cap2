from pymongo import MongoClient
import certifi

MONGO_URL = "mongodb+srv://admin:123456aA.@cluster0.sivzwjm.mongodb.net/?appName=Cluster0"

client = MongoClient(
    MONGO_URL,
    tls=True,
    tlsCAFile=certifi.where()
)


print("Connected to MongoDB")

db = client["edusyncDB"]