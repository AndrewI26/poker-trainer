from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.card import CardStr
from app.models.enums import Move, MoveVerdict, Position


class PreflopResponseCreate(BaseModel):
    table_size: int = Field(ge=6, le=9)
    hero_position: Position
    hero_card_1: CardStr
    hero_card_2: CardStr
    move: Move


class PreflopResponsePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    table_size: int
    hero_position: Position
    hero_card_1: CardStr
    hero_card_2: CardStr
    move: Move
    verdict: MoveVerdict | None
    explanation: str
    recommended_move: Move
    created_at: datetime
    updated_at: datetime
