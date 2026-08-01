from fastapi import APIRouter, status

from app.dependencies.auth import CurrentUser
from app.dependencies.db import Db
from app.models.preflop import PreflopResponse
from app.schemas.preflop import PreflopResponseCreate, PreflopResponsePublic

router = APIRouter(prefix="/preflop", tags=["preflop"])


@router.post(
    "/", status_code=status.HTTP_201_CREATED, response_model=PreflopResponsePublic
)
def create_response(
    body: PreflopResponseCreate,
    current_user: CurrentUser,
    db: Db,
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
