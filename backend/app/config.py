from pydantic_settings import BaseSettings
from typing import List
import secrets

class Settings(BaseSettings):
    MONGO_URI: str
    HF_TOKEN: str
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DB_NAME: str = "textsummarization"
    ENVIRONMENT: str = "development"
    HUGGINGFACE_API_URL: str = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

settings = Settings()