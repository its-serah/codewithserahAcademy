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
    CORS_ORIGINS: str = "https://codewithserahacademy.vercel.app"

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@codewithserah.com"
    MAIL_FROM_NAME: str = "CodewithSerah Academy"
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    FRONTEND_URL: str = "https://codewithserahacademy.vercel.app"

    model_config = {"env_file": ".env"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]


settings = Settings()
