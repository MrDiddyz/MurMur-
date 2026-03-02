import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    app_name: str = os.getenv("APP_NAME", "MurMur RL Engine")
    app_env: str = os.getenv("ENV", os.getenv("APP_ENV", "production"))
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@host:5432/dbname",
    )

    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    epsilon: float = float(os.getenv("EPSILON", "0.2"))
    min_epsilon: float = float(os.getenv("MIN_EPSILON", "0.05"))
    epsilon_decay: float = float(os.getenv("EPSILON_DECAY", "0.995"))


settings = Settings()
