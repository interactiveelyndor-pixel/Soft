from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user, require_ceo
from websockets import manager

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def _today_str() -> str:
    return date.today().isoformat()


@router.post("/checkin", response_model=schemas.AttendanceOut)
async def check_in(
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
    
    # Log system activity
    activity = models.SystemActivity(
        event_type="attendance",
        message=f"{current_user.name} checked in for the day.",
        user_id=current_user.id
    )
    db.add(activity)
    
    db.commit()
    db.refresh(record)
    
    await manager.broadcast("new_activity", {"message": activity.message})
    
    return record


@router.post("/checkout", response_model=schemas.AttendanceOut)
async def check_out(
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
    
    # Check if a work log was submitted today
    work_log = db.query(models.WorkLog).filter(
        models.WorkLog.user_id == current_user.id,
        models.WorkLog.date == today
    ).first()
    
    if not work_log:
        perf = db.query(models.Performance).filter(models.Performance.user_id == current_user.id).first()
        if perf:
            perf.score = max(0, perf.score - 5)
            if perf.score < 70 and perf.zone == models.PerformanceZone.GREEN:
                perf.zone = models.PerformanceZone.RED
                
        activity_msg = f"{current_user.name} checked out early without submitting a daily log. Performance score docked."
    else:
        activity_msg = f"{current_user.name} checked out for the day."

    # Log system activity
    activity = models.SystemActivity(
        event_type="attendance",
        message=activity_msg,
        user_id=current_user.id
    )
    db.add(activity)

    db.commit()
    db.refresh(record)
    
    await manager.broadcast("new_activity", {"message": activity.message})
    
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
