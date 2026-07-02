from datetime import datetime

from app.config import get_settings
from sqlalchemy import DateTime, create_engine, func
from sqlalchemy.orm import Mapped, mapped_column, sessionmaker, DeclarativeBase

settings = get_settings()

engine = create_engine(settings.database_url, echo=settings.env == "development")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
