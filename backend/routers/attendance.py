from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user, require_ceo

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def _today_str() -> str:
    return date.today().isoformat()


@router.post("/checkin", response_model=schemas.AttendanceOut)
def check_in(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Intern checks in for the day. Only one check-in per day allowed."""
    today = _today_str()
    existing = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.date == today
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")

    record = models.Attendance(
        user_id=current_user.id,
        check_in=datetime.utcnow(),
        date=today,
        status="present"
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/checkout", response_model=schemas.AttendanceOut)
def check_out(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Intern checks out for the day."""
    today = _today_str()
    record = db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.date == today
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="No check-in found for today")
    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")

    record.check_out = datetime.utcnow()
    db.commit()
    db.refresh(record)
    return record


@router.get("/me", response_model=List[schemas.AttendanceOut])
def my_attendance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get my attendance history."""
    return db.query(models.Attendance)\
        .filter(models.Attendance.user_id == current_user.id)\
        .order_by(models.Attendance.date.desc())\
        .limit(30)\
        .all()


@router.get("/today", response_model=schemas.AttendanceOut | None)
def today_attendance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get today's attendance record for current user."""
    today = _today_str()
    return db.query(models.Attendance).filter(
        models.Attendance.user_id == current_user.id,
        models.Attendance.date == today
    ).first()


@router.get("/all", response_model=List[schemas.AttendanceOut])
def all_attendance(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Get all attendance records. CEO only."""
    return db.query(models.Attendance)\
        .order_by(models.Attendance.date.desc())\
        .limit(100)\
        .all()
