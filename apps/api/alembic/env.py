import importlib
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import create_engine

from app.config import get_settings
from app.db import Base

for _path in (Path(__file__).parent.parent / "app" / "models").glob("*.py"):
    if not _path.name.startswith("_"):
        importlib.import_module(f"app.models.{_path.stem}")

config = context.config

if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

settings = get_settings()


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(settings.database_url)

    with engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
