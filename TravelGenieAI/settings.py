import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OVERPASS_URL = "http://overpass-api.de/api/interpreter"