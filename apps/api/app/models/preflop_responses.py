import enum
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    UUID as SQLAlchemyUUID,
    CheckConstraint,
    Enum as SQLAlchemyEnum,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.users import User


class Position(str, enum.Enum):
    UTG = "UTG"
    UTG_PLUS_1 = "UTG+1"
    UTG_PLUS_2 = "UTG+2"
    LJ = "LJ"
    HJ = "HJ"
    CO = "CO"
    BTN = "BTN"
    SB = "SB"
    BB = "BB"


class PreflopMove(str, enum.Enum):
    FOLD = "fold"
    CALL = "call"
    RAISE = "raise"
    ALLIN = "allin"


class PreflopActionType(str, enum.Enum):
    FOLD = "fold"
    LIMP = "limp"
    RAISE = "raise"
    RERAISE = "reraise"
    ALLIN = "allin"


class PreflopVerdict(str, enum.Enum):
    CORRECT = "correct"
    ACCEPTABLE = "acceptable"
    INCORRECT = "incorrect"


def _enum_column(python_enum: type[enum.Enum], name: str) -> SQLAlchemyEnum:
    return SQLAlchemyEnum(
        python_enum, name=name, values_callable=lambda e: [m.value for m in e]
    )


class PreflopResponse(Base):
    __tablename__ = "preflop_responses"
    __table_args__ = (CheckConstraint("table_size BETWEEN 2 AND 9"),)

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

    seed: Mapped[int] = mapped_column(nullable=False)
    table_size: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    hero_position: Mapped[Position] = mapped_column(
        _enum_column(Position, "poker_position"), nullable=False
    )
    hero_stack_bb: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)

    small_blind_bb: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    big_blind_bb: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    ante_bb: Mapped[Decimal] = mapped_column(
        Numeric(6, 2), nullable=False, default=0, server_default="0"
    )

    hero_card_1: Mapped[str] = mapped_column(String(2), nullable=False)
    hero_card_2: Mapped[str] = mapped_column(String(2), nullable=False)

    move: Mapped[PreflopMove] = mapped_column(
        _enum_column(PreflopMove, "preflop_move"), nullable=False
    )
    raise_size_bb: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))

    verdict: Mapped[PreflopVerdict] = mapped_column(
        _enum_column(PreflopVerdict, "preflop_verdict"), nullable=False
    )
    explanation: Mapped[str] = mapped_column(Text, nullable=False)

    recommended_move: Mapped[PreflopMove] = mapped_column(
        _enum_column(PreflopMove, "preflop_move"), nullable=False
    )
    recommended_raise_size_bb: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))

    actions: Mapped[list["PreflopResponseAction"]] = relationship(
        back_populates="response",
        cascade="all, delete-orphan",
        order_by="PreflopResponseAction.sequence",
    )


class PreflopResponseAction(Base):
    __tablename__ = "preflop_response_actions"
    __table_args__ = (UniqueConstraint("response_id", "sequence"),)

    id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4
    )

    response_id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("preflop_responses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    response: Mapped[PreflopResponse] = relationship(back_populates="actions")

    sequence: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    position: Mapped[Position] = mapped_column(
        _enum_column(Position, "poker_position"), nullable=False
    )
    action_type: Mapped[PreflopActionType] = mapped_column(
        _enum_column(PreflopActionType, "preflop_action_type"), nullable=False
    )
    size_bb: Mapped[Decimal | None] = mapped_column(Numeric(6, 2))
