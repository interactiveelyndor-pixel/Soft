from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import require_ceo

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Return real-time CEO dashboard KPI stats."""
    active_projects = db.query(models.Project).filter(
        models.Project.status == models.ProjectStatus.ACTIVE
    ).all()

    active_games = sum(1 for p in active_projects if p.project_type and "game" in p.project_type.lower())
    active_software = sum(1 for p in active_projects if p.project_type and "software" in p.project_type.lower())

    total_team = db.query(models.User).filter(models.User.is_active == True).count()

    open_roles = db.query(models.Role).filter(
        models.Role.status == models.RoleStatus.OPEN
    ).count()

    active_clients = db.query(models.Client).filter(
        models.Client.status == models.ClientStatus.ACTIVE
    ).count()

    green_performers = db.query(models.Performance).filter(
        models.Performance.zone == models.PerformanceZone.GREEN
    ).count()

    red_zone_count = db.query(models.Performance).filter(
        models.Performance.zone == models.PerformanceZone.RED
    ).count()

    return {
        "active_games": active_games,
        "active_software": active_software,
        "total_team": total_team,
        "open_roles": open_roles,
        "active_clients": active_clients,
        "green_performers": green_performers,
        "red_zone_count": red_zone_count,
    }
