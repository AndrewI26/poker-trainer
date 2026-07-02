import enum
from uuid import UUID, uuid4

import email_validator
from sqlalchemy import UUID as SQLAlchemyUUID, Enum as SQLAlchemyEnum, String
from sqlalchemy.orm import Mapped, mapped_column, validates
from app.db import Base


class UserRole(str, enum.Enum):
    FREE = "free"
    PREMIUM = "premium"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    username: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        SQLAlchemyEnum(
            UserRole, name="user_role", values_callable=lambda e: [m.value for m in e]
        ),
        nullable=False,
        default=UserRole.FREE,
        server_default=UserRole.FREE.value,
    )

    @validates("username")
    def validate_username(self, key: str, value: str) -> str:
        email_validator.validate_email(value, check_deliverability=False)
        return value
