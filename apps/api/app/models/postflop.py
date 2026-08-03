# Disabled until the postflop router is built. While this model is registered on
# Base.metadata, every `alembic revision --autogenerate` pulls postflop_response
# into unrelated migrations. Re-enabling requires its own migration, using
# sa.String(length=2) for the card columns and
# postgresql.ENUM(..., name="table_position", create_type=False) to reuse the
# existing enum type.

# from uuid import UUID, uuid4
#
# from sqlalchemy import (
#     UUID as SQLAlchemyUUID,
# )
# from sqlalchemy import (
#     SmallInteger,
# )
# from sqlalchemy.orm import Mapped, mapped_column, relationship
#
# from app.db import Base
# from app.models.card import CardType
# from app.models.enums import Position, PositionType
# from app.models.users import User
#
#
# class PostflopScenario(Base):
#     __tablename__ = "postflop_response"
#
#     id: Mapped[UUID] = mapped_column(
#         SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4
#     )
#
#     user_id: Mapped[UUID] = mapped_column(SQLAlchemyUUID(as_uuid=True))
#     user: Mapped[User] = relationship()
#
#     table_size: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=6)
#
#     hero_position: Mapped[Position] = mapped_column(PositionType, nullable=False)
#
#     hero_card_1: Mapped[str] = mapped_column(CardType, nullable=False)
#     hero_card_2: Mapped[str] = mapped_column(CardType, nullable=False)
