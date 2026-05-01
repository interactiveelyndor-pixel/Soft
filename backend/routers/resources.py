from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import require_core_team_or_admin

router = APIRouter(prefix="/resources", tags=["Human Resources"])


@router.get("/", response_model=List[schemas.RoleOut])
def list_roles(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """List all open/filled roles. CEO only."""
    return db.query(models.Role).all()


@router.post("/{role_id}/applicants", response_model=schemas.ApplicantOut)
def add_applicant(
    role_id: int,
    data: schemas.ApplicantCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """Add an applicant to a role pipeline."""
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    applicant = models.Applicant(
        role_id=role_id,
        name=data.name,
        stage=data.stage,
        email=data.email,
        notes=data.notes
    )
    db.add(applicant)
    db.commit()
    db.refresh(applicant)
    return applicant


@router.patch("/{role_id}/applicants/{applicant_id}", response_model=schemas.ApplicantOut)
def update_applicant(
    role_id: int,
    applicant_id: int,
    data: schemas.ApplicantUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """Update applicant stage/notes."""
    applicant = db.query(models.Applicant).filter(
        models.Applicant.id == applicant_id,
        models.Applicant.role_id == role_id
    ).first()
    
    if not applicant:
        raise HTTPException(status_code=404, detail="Applicant not found")
        
    if data.stage is not None:
        applicant.stage = data.stage
    if data.notes is not None:
        applicant.notes = data.notes
        
    db.commit()
    db.refresh(applicant)
    return applicant


@router.post("/", response_model=schemas.RoleOut, status_code=201)
def create_role(
    data: schemas.RoleCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
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
    _: models.User = Depends(require_core_team_or_admin)
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
    _: models.User = Depends(require_core_team_or_admin)
):
    """Delete a role. CEO only."""
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()


@router.post("/{role_id}/job-listings", response_model=schemas.JobListingOut)
def add_job_listing(
    role_id: int,
    data: schemas.JobListingCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
):
    """Publish to a job board."""
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    listing = models.JobListing(
        role_id=role_id,
        platform=data.platform,
        url=data.url,
        status=data.status
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing
