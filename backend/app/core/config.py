from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "M-Motors API"
    SECRET_KEY: str = "changeme-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./mmotors.db"

    model_config = {"env_file": ".env"}


settings = Settings()