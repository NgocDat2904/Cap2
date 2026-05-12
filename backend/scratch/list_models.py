import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=key)

print("Listing models...")
try:
    for model in client.models.list():
        print(f"Model: {model.name}, Supported methods: {model.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")
