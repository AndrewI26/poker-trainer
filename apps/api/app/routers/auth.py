from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.config import SettingsDep
from app.dependencies.auth import (
    CurrentUser,
    create_access_token,
    get_user,
    issue_refresh_token,
    revoke_refresh_token,
    revoke_user_refresh_tokens,
    rotate_refresh_token,
    verify_password,
)
from app.dependencies.db import Db
from app.schemas.users import RefreshTokenRequest, TokenPair, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token", response_model=TokenPair)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Db,
    settings: SettingsDep,
):
    user = get_user(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    refresh_token, _ = issue_refresh_token(db, user.id, settings)
    db.commit()

    return {
        "access_token": create_access_token(user.username, settings),
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: RefreshTokenRequest, db: Db, settings: SettingsDep):
    user, refresh_token = rotate_refresh_token(db, body.refresh_token, settings)

    return {
        "access_token": create_access_token(user.username, settings),
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshTokenRequest, db: Db):
    revoke_refresh_token(db, body.refresh_token)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(current_user: CurrentUser, db: Db):
    revoke_user_refresh_tokens(db, current_user.id)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserPublic)
async def me(current_user: CurrentUser):
    return current_user
