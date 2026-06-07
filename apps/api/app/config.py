from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=("../../.env", ".env"), env_file_encoding="utf-8", extra="ignore")

    database_url: str
    api_port: int
    api_title: str = "Poker Trainer API"


settings = Settings() # type: ignore
