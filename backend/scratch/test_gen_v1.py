import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
# Try setting API version to v1
client = genai.Client(api_key=key, http_options={'api_version': 'v1'})

print("Generating content with gemini-1.5-flash (v1)...")
try:
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Hello, how are you?'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
