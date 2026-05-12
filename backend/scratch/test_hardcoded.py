from google import genai

key = "AIzaSyDA67SSsps1NKMbUPLtgIpeCzeZBGSKLOA"
client = genai.Client(api_key=key)

print("Hardcoded key test...")
try:
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Hello'
    )
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
