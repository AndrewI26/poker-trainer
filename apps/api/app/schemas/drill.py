from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DrillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    tags: str | None = Field(None, max_length=512)


class DrillUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    tags: str | None = Field(None, max_length=512)


class DrillRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    tags: str | None
    created_at: datetime
    updated_at: datetime
