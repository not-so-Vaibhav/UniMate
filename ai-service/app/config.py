import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "UniMate AI Service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("AI_SERVICE_PORT", 8000))
    HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:5001")
    
    # Hybrid AI Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    AI_MODE: str = os.getenv("AI_MODE", "HYBRID").upper()  # 'HYBRID', 'DETERMINISTIC_ONLY', 'GEMINI_ONLY'
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.28"))
    GEMINI_TIMEOUT_SECONDS: float = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "8.0"))

settings = Settings()
