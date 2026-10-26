import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional

# Compute absolute canonical project root and SQLite path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
CANONICAL_SQLITE_PATH = (PROJECT_ROOT / "intelligence_fusion.db").as_posix()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Intelligence Fusion Platform"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "academic-mini-project-secret-key-saatvik-satyam-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours for academic ease
    
    # SQL Database configuration (PostgreSQL primary with seamless SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/intelligence_fusion")
    FALLBACK_SQLITE_URL: str = os.getenv("SQLITE_URL", f"sqlite:///{CANONICAL_SQLITE_PATH}")
    
    # MongoDB configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "intelligence_fusion")
    
    # Academic Project Information
    TEAM_MEMBERS: list = [
        {"name": "Saatvik Gupta", "srn": "PES1UG24CS395", "role": "Backend & Database Architect"},
        {"name": "Satyam Goyal", "srn": "PES1UG24CS424", "role": "Frontend & Analytics Lead"}
    ]
    PROJECT_TYPE: str = "DBMS Mini Project"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
