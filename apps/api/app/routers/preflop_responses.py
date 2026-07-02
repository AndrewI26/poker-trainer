from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.preflop_responses import PreflopResponse, PreflopResponseAction
from app.models.users import User
from app.schemas.preflop_responses import PreflopResponseCreate, PreflopResponsePublic

router = APIRouter(prefix="/preflop-responses", tags=["preflop-responses"])


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
        seed=body.seed,
        table_size=body.table_size,
        hero_position=body.hero_position,
        hero_stack_bb=body.hero_stack_bb,
        small_blind_bb=body.small_blind_bb,
        big_blind_bb=body.big_blind_bb,
        ante_bb=body.ante_bb,
        hero_card_1=body.hero_card_1,
        hero_card_2=body.hero_card_2,
        move=body.move,
        raise_size_bb=body.raise_size_bb,
        verdict=body.verdict,
        explanation=body.explanation,
        recommended_move=body.recommended_move,
        recommended_raise_size_bb=body.recommended_raise_size_bb,
        actions=[
            PreflopResponseAction(
                sequence=i,
                position=action.position,
                action_type=action.action_type,
                size_bb=action.size_bb,
            )
            for i, action in enumerate(body.actions)
        ],
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    return response


@router.get("/", response_model=list[PreflopResponsePublic])
def list_responses(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    stmt = (
        select(PreflopResponse)
        .where(PreflopResponse.user_id == current_user.id)
        .options(selectinload(PreflopResponse.actions))
        .order_by(PreflopResponse.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return db.execute(stmt).scalars().all()


@router.get("/{response_id}", response_model=PreflopResponsePublic)
def get_response(
    response_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    stmt = (
        select(PreflopResponse)
        .where(PreflopResponse.id == response_id)
        .options(selectinload(PreflopResponse.actions))
    )
    response = db.execute(stmt).scalar_one_or_none()
    if response is None or response.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Response not found"
        )
    return response
