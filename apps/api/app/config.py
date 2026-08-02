from functools import lru_cache
from typing import Annotated, Literal

from fastapi import Depends
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: Literal["development", "production"]
    database_url: str
    api_port: int
    api_title: str = "Poker Trainer API"

    access_token_secret_key: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 60


@lru_cache
def get_settings():
    return Settings()  # type: ignore


SettingsDep = Annotated[Settings, Depends(get_settings)]
