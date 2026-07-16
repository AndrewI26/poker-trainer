from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.models.users import User, UserRole

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("dummypassword")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


def hash_password(password: str):
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)


def get_user(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def authenticate_user(db: Session, username: str, password):
    user = get_user(db, username)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.InvalidTokenError as err:
        raise credentials_exception from err
    user = get_user(db, token_data.username)  # type: ignore
    if user is None:
        raise credentials_exception
    return user


_ROLE_LEVELS = {UserRole.FREE: 0, UserRole.PREMIUM: 1, UserRole.ADMIN: 2}


def require_role(minimum: UserRole):
    def dependency(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if _ROLE_LEVELS[current_user.role] < _ROLE_LEVELS[minimum]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
