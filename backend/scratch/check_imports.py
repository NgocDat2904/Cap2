import sys
import os

try:
    from google import genai
    print("SUCCESS: Imported genai from google")
except ImportError as e:
    print(f"IMPORT ERROR (genai): {e}")
except Exception as e:
    print(f"OTHER ERROR (genai): {e}")

try:
    import google.generativeai as old_genai
    print("SUCCESS: Imported google.generativeai")
except ImportError as e:
    print(f"IMPORT ERROR (old_genai): {e}")
except Exception as e:
    print(f"OTHER ERROR (old_genai): {e}")

print(f"Python executable: {sys.executable}")
print(f"Python path: {sys.path}")
