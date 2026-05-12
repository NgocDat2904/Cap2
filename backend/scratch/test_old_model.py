from google import genai

key = "AIzaSyDA67SSsps1NKMbUPLtgIpeCzeZBGSKLOA"
client = genai.Client(api_key=key)

print("Testing gemini-1.0-pro with new SDK...")
try:
    response = client.models.generate_content(
        model='gemini-1.0-pro',
        contents='Hello'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
