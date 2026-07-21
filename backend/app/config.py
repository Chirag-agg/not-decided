import os

class Settings:
    # API Configuration
    PROJECT_NAME: str = "Industrial Knowledge Intelligence API"
    VERSION: str = "1.0.0"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        os.getenv("FRONTEND_URL", "*")
    ]
    
    # LLM Settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "llama3:latest")
    LLM_TIMEOUT: int = int(os.getenv("LLM_TIMEOUT", "10"))
    
    # Cache Settings
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "3600"))

settings = Settings()
