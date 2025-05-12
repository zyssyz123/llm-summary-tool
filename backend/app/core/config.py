import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# API Configuration
API_V1_PREFIX = "/api/v1"
PROJECT_NAME = os.getenv("APP_NAME", "AI Content Assistant")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", "sqlite:///./app.db"
)  # Default to SQLite if not specified

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# File Upload Configuration
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
MAX_UPLOAD_SIZE = 20 * 1024 * 1024  # 20 MB

# Make sure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True) 