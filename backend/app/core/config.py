from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "M-Motors API"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str
    SENTRY_DSN: str | None = None

    TESTING: bool = False

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


settings = Settings()