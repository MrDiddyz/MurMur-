import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """Application runtime settings loaded from environment variables."""

    api_key: str = "dev-api-key"


settings = Settings(api_key=os.getenv("MURMUR_API_KEY", "dev-api-key"))
