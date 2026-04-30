from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("/", response_model=List[schemas.SystemActivityOut])
def get_recent_activities(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get the 50 most recent system activities."""
    return db.query(models.SystemActivity)\
        .order_by(models.SystemActivity.created_at.desc())\
        .limit(50)\
        .all()
