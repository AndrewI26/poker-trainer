from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.dependencies.auth import (
    CurrentUser,
    hash_password,
    require_role,
    verify_password,
)
from app.dependencies.db import Db
from app.models.users import User, UserRole
from app.schemas.users import UserCreate, UserDelete, UserPublic, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    response_model=list[UserPublic],
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)
def list_users(
    db: Db,
):
    return db.execute(select(User)).scalars().all()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
def create_user(user: UserCreate, db: Db):
    new_user = User(
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hash_password(user.password),
        onboarding_submission=user.onboarding_submission,
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


@router.put("/", response_model=UserPublic)
def update_current_user(
    body: UserUpdate,
    current_user: CurrentUser,
    db: Db,
):
    update_user_data = body.model_dump(exclude_unset=True)

    if not update_user_data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No fields to update")

    stmt = (
        update(User)
        .where(User.id == current_user.id)
        .values(**update_user_data)
        .returning(User)
    )

    updated_user = db.scalar(stmt)
    db.commit()

    return updated_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    body: UserDelete,
    current_user: CurrentUser,
    db: Db,
):
    if not verify_password(body.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    db.delete(current_user)
    db.commit()
