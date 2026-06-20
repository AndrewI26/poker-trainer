from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID


class UserCreate(BaseModel):
    email: str
    username: str
    password: str = Field(min_length=8, max_length=72)


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    username: str

    created_at: datetime
    updated_at: datetime
