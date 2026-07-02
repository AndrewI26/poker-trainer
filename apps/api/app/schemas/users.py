from datetime import datetime

from app.models.users import UserRole
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from uuid import UUID


class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    username: EmailStr
    first_name: str
    last_name: str
    password: str = Field(min_length=8, max_length=72)


class UserDelete(BaseModel):
    password: str


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: EmailStr
    first_name: str
    last_name: str
    role: UserRole

    created_at: datetime
    updated_at: datetime
