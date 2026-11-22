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

settings = Settings()
