from functools import lru_cache
from typing import Literal

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


@lru_cache
def get_settings():
    return Settings()  # type: ignore
