import os

from pydantic_settings import BaseSettings

_default_db = os.environ.get(
    "DATABASE_URL",
    "postgresql://academy:academy_dev@localhost:5432/academy",
)


class Settings(BaseSettings):
    DATABASE_URL: str = _default_db
    SECRET_KEY: str = "change-me-to-a-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_EMAIL: str = "admin@codewithserah.com"
    ADMIN_PASSWORD: str = "admin123"
    CORS_ORIGINS: str = "http://localhost:5173"

    model_config = {"env_file": ".env"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]


settings = Settings()
