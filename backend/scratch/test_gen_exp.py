import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=key)

print("Generating content with gemini-2.0-flash-exp...")
try:
    response = client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents='Hello, how are you?'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
