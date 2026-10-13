from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "The Lenny Growth Assistant"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", description="development | test | production")
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./lenny_growth.db",
        description="Async SQLAlchemy DB URL (PostgreSQL in Docker, SQLite for standalone/tests)"
    )
    
    # LLM Providers
    DEFAULT_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:8b"
    
    ANTHROPIC_API_KEY: str | None = None
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o"
    
    # RAG Settings
    DATA_DIR: str = str(Path(__file__).resolve().parent.parent.parent.parent / "data" / "sample_transcripts")
    VECTOR_SIMILARITY_THRESHOLD: float = 0.25
    TOP_K_CHUNKS: int = 4
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
