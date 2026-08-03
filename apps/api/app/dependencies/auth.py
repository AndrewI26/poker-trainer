import secrets
from datetime import UTC, datetime, timedelta
from hashlib import sha256
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pwdlib import PasswordHash
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.config import Settings, SettingsDep
from app.dependencies.db import get_db
from app.models.refresh_token import RefreshToken
from app.models.users import User, UserRole

ALGORITHM = "HS256"
REFRESH_TOKEN_BYTES = 32

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("dummypassword")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


class TokenData(BaseModel):
    username: str | None = None


def invalid_credentials(detail: str = "Could not validate credentials"):
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


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


def create_access_token(username: str, settings: Settings) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": username, "exp": expire},
        settings.access_token_secret_key,
        algorithm=ALGORITHM,
    )


def hash_refresh_token(token: str) -> str:
    return sha256(token.encode()).hexdigest()


def _as_utc(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


def issue_refresh_token(
    db: Session, user_id: UUID, settings: Settings
) -> tuple[str, RefreshToken]:
    plaintext = secrets.token_urlsafe(REFRESH_TOKEN_BYTES)
    row = RefreshToken(
        user_id=user_id,
        token_hash=hash_refresh_token(plaintext),
        expires_at=datetime.now(UTC)
        + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(row)
    return plaintext, row


def get_refresh_token(db: Session, presented: str) -> RefreshToken | None:
    return db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(presented)
        )
    )


def revoke_token_family(db: Session, row: RefreshToken) -> None:
    now = datetime.now(UTC)
    seen: set[UUID] = set()
    current: RefreshToken | None = row

    while current is not None and current.id not in seen:
        seen.add(current.id)
        if current.revoked_at is None:
            current.revoked_at = now
        current = (
            db.get(RefreshToken, current.replaced_by_id)
            if current.replaced_by_id is not None
            else None
        )


def revoke_user_refresh_tokens(db: Session, user_id: UUID) -> None:
    db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        )
        .values(revoked_at=datetime.now(UTC))
    )


def revoke_refresh_token(db: Session, presented: str) -> None:
    row = get_refresh_token(db, presented)
    if row is not None and row.revoked_at is None:
        row.revoked_at = datetime.now(UTC)


def rotate_refresh_token(
    db: Session, presented: str, settings: Settings
) -> tuple[User, str]:
    row = get_refresh_token(db, presented)

    if row is None:
        raise invalid_credentials("Invalid refresh token")

    if row.revoked_at is not None or row.replaced_by_id is not None:
        revoke_token_family(db, row)
        db.commit()
        raise invalid_credentials("Invalid refresh token")

    if _as_utc(row.expires_at) <= datetime.now(UTC):
        raise invalid_credentials("Invalid refresh token")

    user = row.user
    plaintext, replacement = issue_refresh_token(db, row.user_id, settings)
    db.flush()

    row.replaced_by_id = replacement.id
    row.revoked_at = datetime.now(UTC)
    db.commit()

    return user, plaintext


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
    settings: SettingsDep,
):
    credentials_exception = invalid_credentials()
    try:
        payload = jwt.decode(
            token, settings.access_token_secret_key, algorithms=[ALGORITHM]
        )
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


CurrentUser = Annotated[User, Depends(get_current_user)]

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
