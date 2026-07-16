from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.card import Rank, Suit
from app.models.enums import Move, MoveVerdict, Position


class PreflopResponseCreate(BaseModel):
    table_size: int = Field(ge=6, le=9)
    hero_position: Position
    hero_card_1: str = Field(min_length=2, max_length=2)
    hero_card_2: str = Field(min_length=2, max_length=2)
    move: Move

    @field_validator("hero_card_1", "hero_card_2")
    @classmethod
    def valid_card(cls, v: str) -> str:
        try:
            Rank(v[0])
            Suit(v[1])
        except ValueError:
            raise ValueError(f"'{v}' is not a valid card (e.g. 'Ah', 'Ks')")
        return v


class PreflopResponsePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    table_size: int
    hero_position: Position
    hero_card_1: str
    hero_card_2: str

    @field_validator("hero_card_1", "hero_card_2", mode="before")
    @classmethod
    def card_to_str(cls, v: object) -> str:
        return str(v)

    move: Move
    verdict: MoveVerdict | None
    explanation: str
    recommended_move: Move
    created_at: datetime
    updated_at: datetime
