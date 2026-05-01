from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user, require_core_team_or_admin
from socket_manager import manager

router = APIRouter(prefix="/projects", tags=["Projects"])

def recalculate_progress(project: models.Project):
    if not project.tasks:
        project.progress = 0.0
        return
    completed = sum(1 for t in project.tasks if t.is_completed)
    project.progress = round((completed / len(project.tasks)) * 100, 1)


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
    _: models.User = Depends(require_core_team_or_admin)
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


@router.post("/{project_id}/tasks", response_model=schemas.ProjectTaskOut)
async def create_task(
    project_id: int,
    data: schemas.ProjectTaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    task = models.ProjectTask(
        project_id=project_id,
        title=data.title,
        is_completed=data.is_completed
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Recalculate progress
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    recalculate_progress(project)
    
    activity = models.SystemActivity(
        event_type="project",
        message=f"{current_user.name} added task '{task.title}' to {project.name}.",
        user_id=current_user.id
    )
    db.add(activity)
    db.commit()
    
    await manager.broadcast("new_activity", {"message": activity.message})
    return task


@router.patch("/{project_id}/tasks/{task_id}", response_model=schemas.ProjectTaskOut)
async def update_task(
    project_id: int,
    task_id: int,
    data: schemas.ProjectTaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.ProjectTask).filter(models.ProjectTask.id == task_id, models.ProjectTask.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if data.title is not None:
        task.title = data.title
    if data.is_completed is not None:
        task.is_completed = data.is_completed
        
    db.commit()
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    recalculate_progress(project)
    
    if data.is_completed is not None:
        activity = models.SystemActivity(
            event_type="project",
            message=f"{current_user.name} marked task '{task.title}' as {'completed' if task.is_completed else 'pending'} in {project.name}.",
            user_id=current_user.id
        )
        db.add(activity)
        db.commit()
        await manager.broadcast("new_activity", {"message": activity.message})
    else:
        db.commit()
        
    db.refresh(task)
    return task


@router.delete("/{project_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.ProjectTask).filter(models.ProjectTask.id == task_id, models.ProjectTask.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db.delete(task)
    db.commit()
    
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    recalculate_progress(project)
    db.commit()


@router.post("/", response_model=schemas.ProjectOut, status_code=201)
def create_project(
    data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_core_team_or_admin)
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
    _: models.User = Depends(require_core_team_or_admin)
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
    _: models.User = Depends(require_core_team_or_admin)
):
    """Delete a project. CEO only."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
