from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user, require_ceo

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """List all projects."""
    return db.query(models.Project).all()


@router.post("/{project_id}/members", response_model=schemas.ProjectOut)
def assign_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Assign an operative to a project."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user not in project.members:
        project.members.append(user)
        db.commit()
        db.refresh(project)
        
    return project


@router.post("/{project_id}/activities", response_model=schemas.ProjectActivityOut)
def log_activity(
    project_id: int,
    data: schemas.ProjectActivityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Log an automated activity or build run."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    activity = models.ProjectActivity(
        project_id=project_id,
        action=data.action,
        target=data.target,
        user_name=data.user_name or current_user.name
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.post("/", response_model=schemas.ProjectOut, status_code=201)
def create_project(
    data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Create a new project. CEO only."""
    project = models.Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a single project."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    data: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Update a project. CEO only."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Delete a project. CEO only."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
