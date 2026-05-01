from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from database import get_db
import models
import schemas
from auth import require_core_team_or_admin

router = APIRouter(prefix="/performance", tags=["Performance"])


@router.get("/", response_model=List[schemas.PerformanceOut])
def list_performance(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """Get all performance records. CEO only."""
    return db.query(models.Performance)\
        .options(joinedload(models.Performance.user))\
        .all()


@router.patch("/", response_model=schemas.PerformanceOut)
def update_performance(
    data: schemas.PerformanceUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """Update or create a performance record for a user. CEO only."""
    record = db.query(models.Performance).filter(
        models.Performance.user_id == data.user_id
    ).first()

    if not record:
        record = models.Performance(user_id=data.user_id)
        db.add(record)

    record.zone = data.zone
    if data.score is not None:
        record.score = data.score
    if data.notes is not None:
        record.notes = data.notes

    db.commit()
    db.refresh(record)
    return record


@router.get("/users", response_model=List[schemas.UserOut])
def list_team_members(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """List all team members for CEO management view."""
    return db.query(models.User).filter(models.User.is_active == True).all()


@router.patch("/users/{user_id}/deactivate", response_model=schemas.UserOut)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """Deactivate (terminate) a user. CEO only."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False

    # Move to Black zone automatically
    perf = db.query(models.Performance).filter(models.Performance.user_id == user_id).first()
    if perf:
        perf.zone = models.PerformanceZone.BLACK

    db.commit()
    db.refresh(user)
    return user
