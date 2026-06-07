from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Drill
from app.schemas.drill import DrillCreate, DrillRead, DrillUpdate

router = APIRouter(prefix="/drills", tags=["drills"])


@router.get("", response_model=list[DrillRead])
def list_drills(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> list[Drill]:
    stmt = select(Drill).offset(skip).limit(limit).order_by(Drill.id)
    return list(db.scalars(stmt))


@router.post("", response_model=DrillRead, status_code=status.HTTP_201_CREATED)
def create_drill(payload: DrillCreate, db: Session = Depends(get_db)) -> Drill:
    drill = Drill(name=payload.name, description=payload.description, tags=payload.tags)
    db.add(drill)
    db.commit()
    db.refresh(drill)
    return drill


@router.get("/{drill_id}", response_model=DrillRead)
def get_drill(drill_id: int, db: Session = Depends(get_db)) -> Drill:
    drill = db.get(Drill, drill_id)
    if drill is None:
        raise HTTPException(status_code=404, detail="Drill not found")
    return drill


@router.patch("/{drill_id}", response_model=DrillRead)
def update_drill(
    drill_id: int, payload: DrillUpdate, db: Session = Depends(get_db)
) -> Drill:
    drill = db.get(Drill, drill_id)
    if drill is None:
        raise HTTPException(status_code=404, detail="Drill not found")
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(drill, key, value)
    drill.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(drill)
    return drill


@router.delete("/{drill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_drill(drill_id: int, db: Session = Depends(get_db)) -> None:
    drill = db.get(Drill, drill_id)
    if drill is None:
        raise HTTPException(status_code=404, detail="Drill not found")
    db.delete(drill)
    db.commit()
