from app.dependencies.db import get_db
from app.models.users import User
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
def list_users(db: Session = Depends(get_db)):
    stmt = select(User)

    result = db.execute(stmt)
    users = result.scalars().all()
    return users
