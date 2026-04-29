from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import require_ceo

router = APIRouter(prefix="/resources", tags=["Human Resources"])


@router.get("/", response_model=List[schemas.RoleOut])
def list_roles(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """List all open/filled roles. CEO only."""
    return db.query(models.Role).all()


@router.post("/", response_model=schemas.RoleOut, status_code=201)
def create_role(
    data: schemas.RoleCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Create a new role/position. CEO only."""
    role = models.Role(**data.model_dump())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.patch("/{role_id}", response_model=schemas.RoleOut)
def update_role(
    role_id: int,
    data: schemas.RoleUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Update a role. CEO only."""
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(role, field, value)

    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=204)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Delete a role. CEO only."""
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
