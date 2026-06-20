from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.users import UserCreate, UserPublic
from fastapi import APIRouter, Depends, status
from sqlalchemy import select, insert
from sqlalchemy.orm import Session
from pwdlib import PasswordHash


router = APIRouter(prefix="/users", tags=["users"])

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("dummypassword")


def hash_password(password: str):
    return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return password_hash.verify(plain_password, hashed_password)


def get_user(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def authenticate_user(db: Session, email: str, password):
    user = get_user(db, email)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


@router.get("/", response_model=list[UserPublic])
def list_users(db: Session = Depends(get_db)):
    stmt = select(User)

    result = db.execute(stmt)
    users = result.scalars().all()
    return users


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = hash_password(user.password)

    stmt = (
        insert(User)
        .values(
            email=user.email, username=user.username, hashed_password=hashed_password
        )
        .returning(User)
    )

    result = db.execute(stmt)
    db.commit()
    created_user = result.scalar_one()

    return created_user
