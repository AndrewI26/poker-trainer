from typing import Annotated

from app.dependencies.auth import get_current_active_user, hash_password
from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.users import UserCreate, UserPublic
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import insert, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserPublic])
def list_users(db: Session = Depends(get_db)):
    return db.execute(select(User)).scalars().all()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    stmt = (
        insert(User)
        .values(
            email=user.email,
            username=user.username,
            hashed_password=hash_password(user.password),
        )
        .returning(User)
    )
    try:
        result = db.execute(stmt)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that email or username already exists",
        )
    return result.scalar_one()


@router.get("/me")
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user
