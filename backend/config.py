import os

class Config:
    APP_NAME = "trust-platform"
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
    API_KEY = os.getenv("API_KEY", "dev-api-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret-key-123")
    
    # Database - STRICT POSTGRESQL (Blocking Issue 1)
    # 🔴 BLOCKER 0 – Mandatory PostgreSQL (Fail Fast)
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is REQUIRED. "
            "PostgreSQL is mandatory for SOC backend. "
            "No sqlite or fallback allowed."
        )

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Rate Limiting
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_DEFAULT = "5000 per day; 2000 per hour"
    
    # ML & Simulation
    ML_PIPELINE_VERSION = "2.0.0"
    SIMULATION_MODE = os.getenv("SIMULATION_MODE", "False") == "True"

    # Headers
    API_KEY_HEADER = "X-API-Key"
    SESSION_ID_HEADER = "X-Session-ID"
    
    # Logging
    LOG_FILE = os.getenv("LOG_FILE", "platform.log")
