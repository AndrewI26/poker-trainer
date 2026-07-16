import enum
from uuid import UUID, uuid4

from sqlalchemy import (
    UUID as SQLAlchemyUUID,
)
from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    SmallInteger,
    Text,
)
from sqlalchemy import (
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.card import CardType
from app.models.enums import (
    Move,
    MoveType,
    MoveVerdict,
    MoveVerdictType,
    Position,
    PositionType,
)
from app.models.users import User


class PreflopScenario(enum.StrEnum):
    OPEN = "open"
    VS_OPEN = "vs_open"
    THREEBET = "3bet"
    VS_THREEBET = "vs_3bet"
    FOURBET = "4bet"
    VS_FOURBET = "vs_4bet"
    FIVEBET = "5bet"


PreflopScenarioType = SQLAlchemyEnum(
    PreflopScenario,
    name="preflop_scenario",
    values_callable=lambda e: [m.value for m in e],
)


class PreflopResponse(Base):
    __tablename__ = "preflop_responses"
    __table_args__ = (CheckConstraint("table_size BETWEEN 6 AND 9"),)

    id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4
    )

    user_id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user: Mapped[User] = relationship()

    table_size: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    hero_position: Mapped[Position] = mapped_column(PositionType, nullable=False)

    hero_card_1: Mapped[str] = mapped_column(CardType, nullable=False)
    hero_card_2: Mapped[str] = mapped_column(CardType, nullable=False)

    move: Mapped[Move] = mapped_column(MoveType, nullable=False)

    verdict: Mapped[MoveVerdict] = mapped_column(MoveVerdictType, nullable=True)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)

    recommended_move: Mapped[Move] = mapped_column(MoveType, nullable=False)
