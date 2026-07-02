from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.preflop_responses import (
    Position,
    PreflopActionType,
    PreflopMove,
    PreflopVerdict,
)


class PreflopActionIn(BaseModel):
    position: Position
    action_type: PreflopActionType
    size_bb: Decimal | None = None

    @model_validator(mode="after")
    def check_size_matches_action(self) -> "PreflopActionIn":
        if self.action_type == PreflopActionType.FOLD and self.size_bb is not None:
            raise ValueError("size_bb must be null for fold")
        if self.action_type != PreflopActionType.FOLD and self.size_bb is None:
            raise ValueError("size_bb is required unless action_type is fold")
        return self


class PreflopResponseCreate(BaseModel):
    seed: int
    table_size: int = Field(ge=2, le=9)
    hero_position: Position
    hero_stack_bb: Decimal
    small_blind_bb: Decimal
    big_blind_bb: Decimal
    ante_bb: Decimal = Decimal("0")
    hero_card_1: str = Field(min_length=2, max_length=2)
    hero_card_2: str = Field(min_length=2, max_length=2)
    move: PreflopMove
    raise_size_bb: Decimal | None = None
    verdict: PreflopVerdict
    explanation: str
    recommended_move: PreflopMove
    recommended_raise_size_bb: Decimal | None = None
    actions: list[PreflopActionIn] = Field(default_factory=list)

    @model_validator(mode="after")
    def check_raise_sizes(self) -> "PreflopResponseCreate":
        if self.move == PreflopMove.RAISE and self.raise_size_bb is None:
            raise ValueError("raise_size_bb is required when move is raise")
        if self.move != PreflopMove.RAISE and self.raise_size_bb is not None:
            raise ValueError("raise_size_bb must be null unless move is raise")
        if (
            self.recommended_move == PreflopMove.RAISE
            and self.recommended_raise_size_bb is None
        ):
            raise ValueError(
                "recommended_raise_size_bb is required when recommended_move is raise"
            )
        if (
            self.recommended_move != PreflopMove.RAISE
            and self.recommended_raise_size_bb is not None
        ):
            raise ValueError(
                "recommended_raise_size_bb must be null unless recommended_move is raise"
            )
        return self


class PreflopActionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sequence: int
    position: Position
    action_type: PreflopActionType
    size_bb: Decimal | None


class PreflopResponsePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    seed: int
    table_size: int
    hero_position: Position
    hero_stack_bb: Decimal
    small_blind_bb: Decimal
    big_blind_bb: Decimal
    ante_bb: Decimal
    hero_card_1: str
    hero_card_2: str
    move: PreflopMove
    raise_size_bb: Decimal | None
    verdict: PreflopVerdict
    explanation: str
    recommended_move: PreflopMove
    recommended_raise_size_bb: Decimal | None
    actions: list[PreflopActionPublic]
    created_at: datetime
    updated_at: datetime
