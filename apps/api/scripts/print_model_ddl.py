"""
Print CREATE TABLE DDL from current SQLAlchemy metadata (PostgreSQL dialect).

For human inspection only. **Alembic** migrations are what actually change the database;
keep models and migrations in sync.

Usage (from repo root):

    cd apps/api && uv run python scripts/print_model_ddl.py
"""

from sqlalchemy.dialects.postgresql import dialect
from sqlalchemy.schema import CreateTable

from app.database import Base
import app.models  # noqa: F401 — register all models on Base.metadata


def main() -> None:
    d = dialect()
    for table in Base.metadata.sorted_tables:
        stmt = CreateTable(table)
        print(str(stmt.compile(dialect=d)) + ";\n")


if __name__ == "__main__":
    main()
