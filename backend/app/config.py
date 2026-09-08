import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Mew API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./mew.db"

    # Security
    SECRET_KEY: str = "mew-super-secret-jwt-key-change-this-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 365  # 1 year (persistent session until signed out)

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Telemetry Cloud Integration
    TELEMETRY_API_URL: str = "https://api.nbsense.in"
    TELEMETRY_USER_ID: str = "1accord@nbsense.com"
    TELEMETRY_PASSWORD: str = "Qwerty@123"
    TELEMETRY_DEFAULT_METER_ID: int = 225

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
