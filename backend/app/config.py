from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://academy:academy_dev@localhost:5432/academy"
    SECRET_KEY: str = "change-me-to-a-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_EMAIL: str = "admin@codewithserah.com"
    ADMIN_PASSWORD: str = "admin123"

    model_config = {"env_file": ".env"}


settings = Settings()
