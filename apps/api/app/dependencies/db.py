from collections.abc import Generator
from typing import Annotated

from sqlalchemy.orm import Session

from app.db import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


Db = Annotated[Session, get_db]
