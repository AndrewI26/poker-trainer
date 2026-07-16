from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.preflop import PreflopResponse
from app.models.users import User
from app.schemas.preflop import PreflopResponseCreate, PreflopResponsePublic

router = APIRouter(prefix="/preflop", tags=["preflop"])


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=PreflopResponsePublic
)
def create_response(
    body: PreflopResponseCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    response = PreflopResponse(
        user_id=current_user.id,
        table_size=body.table_size,
        hero_position=body.hero_position,
        hero_card_1=body.hero_card_1,
        hero_card_2=body.hero_card_2,
        move=body.move,
        verdict=None,
        explanation="",
        recommended_move=body.move,
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return response
