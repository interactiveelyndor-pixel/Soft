from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── ENUMS ───────────────────────────────────
class PerformanceZoneEnum(str, Enum):
    GREEN = "green"
    RED = "red"
    BLACK = "black"

class ProjectStatusEnum(str, Enum):
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ClientStatusEnum(str, Enum):
    ACTIVE = "active"
    PAST = "past"
    PROSPECT = "prospect"

class RoleStatusEnum(str, Enum):
    OPEN = "open"
    FILLED = "filled"
    CLOSED = "closed"


# ─── AUTH ────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "intern"
    department: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str]
    avatar_initials: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# ─── PROJECT ACTIVITY ────────────────────────
class ProjectActivityCreate(BaseModel):
    action: str
    target: Optional[str] = None
    user_name: Optional[str] = None

class ProjectActivityOut(BaseModel):
    id: int
    project_id: int
    action: str
    target: Optional[str]
    user_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── PROJECTS ────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: Optional[str] = None
    engine: Optional[str] = None
    status: ProjectStatusEnum = ProjectStatusEnum.ACTIVE
    progress: float = 0.0
    deadline: Optional[datetime] = None
    client_id: Optional[int] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatusEnum] = None
    progress: Optional[float] = None
    deadline: Optional[datetime] = None
    client_id: Optional[int] = None

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    project_type: Optional[str]
    engine: Optional[str]
    status: ProjectStatusEnum
    progress: float
    deadline: Optional[datetime]
    created_at: datetime
    client_id: Optional[int]
    members: List[UserOut] = []
    activities: List[ProjectActivityOut] = []

    class Config:
        from_attributes = True


# ─── CLIENT COMMUNICATIONS ───────────────────
class ClientCommunicationCreate(BaseModel):
    title: str
    notes: str

class ClientCommunicationOut(BaseModel):
    id: int
    client_id: int
    title: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── CLIENTS ─────────────────────────────────
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    status: ClientStatusEnum = ClientStatusEnum.ACTIVE
    industry: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    status: Optional[ClientStatusEnum] = None
    industry: Optional[str] = None
    notes: Optional[str] = None

class ClientOut(BaseModel):
    id: int
    name: str
    email: Optional[str]
    status: ClientStatusEnum
    industry: Optional[str]
    notes: Optional[str]
    created_at: datetime
    communications: List[ClientCommunicationOut] = []
    # projects can be fetched separately to avoid circular schema dependencies

    class Config:
        from_attributes = True


# ─── APPLICANTS ──────────────────────────────
class ApplicantCreate(BaseModel):
    name: str
    stage: str = "HR Screening"
    email: Optional[str] = None
    notes: Optional[str] = None

class ApplicantUpdate(BaseModel):
    stage: Optional[str] = None
    notes: Optional[str] = None

class ApplicantOut(BaseModel):
    id: int
    role_id: int
    name: str
    stage: str
    email: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── ROLES / RESOURCES ───────────────────────
class RoleCreate(BaseModel):
    title: str
    department: Optional[str] = None
    status: RoleStatusEnum = RoleStatusEnum.OPEN
    slots_required: int = 1
    slots_filled: int = 0
    is_urgent: bool = False
    description: Optional[str] = None
    project_id: Optional[int] = None

class RoleUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[RoleStatusEnum] = None
    slots_required: Optional[int] = None
    slots_filled: Optional[int] = None
    is_urgent: Optional[bool] = None
    description: Optional[str] = None

class RoleOut(BaseModel):
    id: int
    title: str
    department: Optional[str]
    status: RoleStatusEnum
    slots_required: int
    slots_filled: int
    is_urgent: bool
    description: Optional[str]
    project_id: Optional[int]
    created_at: datetime
    applicants: List[ApplicantOut] = []

    class Config:
        from_attributes = True


# ─── ATTENDANCE ──────────────────────────────
class AttendanceCheckIn(BaseModel):
    pass  # timestamp comes from server

class AttendanceCheckOut(BaseModel):
    pass  # timestamp comes from server

class AttendanceOut(BaseModel):
    id: int
    user_id: int
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    date: str
    status: str

    class Config:
        from_attributes = True


# ─── WORK LOGS ───────────────────────────────
class WorkLogCreate(BaseModel):
    tasks_completed: str
    blockers: Optional[str] = None
    hours_worked: Optional[float] = None

class WorkLogOut(BaseModel):
    id: int
    user_id: int
    date: str
    tasks_completed: str
    blockers: Optional[str]
    hours_worked: Optional[float]
    submitted_at: datetime

    class Config:
        from_attributes = True


# ─── PERFORMANCE ─────────────────────────────
class PerformanceUpdate(BaseModel):
    user_id: int
    zone: PerformanceZoneEnum
    score: Optional[float] = None
    notes: Optional[str] = None

class PerformanceOut(BaseModel):
    id: int
    user_id: int
    zone: PerformanceZoneEnum
    score: float
    notes: Optional[str]
    updated_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


# ─── DASHBOARD ───────────────────────────────
class DashboardStats(BaseModel):
    active_games: int
    active_software: int
    total_team: int
    open_roles: int
    active_clients: int
    green_performers: int
    red_zone_count: int
