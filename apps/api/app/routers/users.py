from app.dependencies.db import get_db
from app.models.users import User
from app.schemas.users import UserCreate, UserPublic
from fastapi import APIRouter, Depends, status
from sqlalchemy import select, insert
from sqlalchemy.orm import Session
from passlib.context import CryptContext


router = APIRouter(prefix="/users", tags=["users"])

pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    bcrypt__rounds=12,
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


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
