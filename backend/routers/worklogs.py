from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user, require_ceo

router = APIRouter(prefix="/worklogs", tags=["Work Logs"])

def _today_str() -> str:
    return date.today().isoformat()


@router.post("/", response_model=schemas.WorkLogOut, status_code=201)
def submit_work_log(
    data: schemas.WorkLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Submit daily work log. One submission per day per user."""
    today = _today_str()
    existing = db.query(models.WorkLog).filter(
        models.WorkLog.user_id == current_user.id,
        models.WorkLog.date == today
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Work log already submitted for today")

    log = models.WorkLog(
        user_id=current_user.id,
        date=today,
        tasks_completed=data.tasks_completed,
        blockers=data.blockers,
        hours_worked=data.hours_worked
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/me", response_model=List[schemas.WorkLogOut])
def my_work_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get my work log history (last 30 days)."""
    return db.query(models.WorkLog)\
        .filter(models.WorkLog.user_id == current_user.id)\
        .order_by(models.WorkLog.date.desc())\
        .limit(30)\
        .all()


@router.get("/all", response_model=List[schemas.WorkLogOut])
def all_work_logs(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Get all work logs (CEO view)."""
    return db.query(models.WorkLog)\
        .order_by(models.WorkLog.date.desc())\
        .limit(200)\
        .all()


@router.get("/today", response_model=schemas.WorkLogOut | None)
def today_work_log(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Check if today's log is already submitted."""
    today = _today_str()
    return db.query(models.WorkLog).filter(
        models.WorkLog.user_id == current_user.id,
        models.WorkLog.date == today
    ).first()
