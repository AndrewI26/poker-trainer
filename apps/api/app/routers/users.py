from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.dependencies.auth import (
    get_current_user,
    hash_password,
    require_role,
    verify_password,
)
from app.dependencies.db import get_db
from app.models.users import User, UserRole
from app.schemas.users import UserCreate, UserDelete, UserPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserPublic])
def list_users(
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    return db.execute(select(User)).scalars().all()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hash_password(user.password),
    )
    try:
        db.add(new_user)
        db.commit()
    except IntegrityError as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with that username already exists",
        ) from err
    db.refresh(new_user)
    return new_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    body: UserDelete,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    db.delete(current_user)
    db.commit()
