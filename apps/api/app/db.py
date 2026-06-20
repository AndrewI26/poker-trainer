from app.config import get_settings
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

settings = get_settings()

engine = create_engine(settings.database_url, echo=settings.env == "development")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
