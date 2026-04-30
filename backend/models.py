from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class PerformanceZone(str, enum.Enum):
    GREEN = "green"
    RED = "red"
    BLACK = "black"


class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ClientStatus(str, enum.Enum):
    ACTIVE = "active"
    PAST = "past"
    PROSPECT = "prospect"


class RoleStatus(str, enum.Enum):
    OPEN = "open"
    FILLED = "filled"
    CLOSED = "closed"


# ──────────────────────────────────────────────
# ASSOCIATION TABLES
# ──────────────────────────────────────────────
project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True)
)

# ──────────────────────────────────────────────
# USERS
# ──────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="intern")  # "ceo" | "intern"
    department = Column(String(100), nullable=True)
    avatar_initials = Column(String(5), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    attendance_records = relationship("Attendance", back_populates="user")
    work_logs = relationship("WorkLog", back_populates="user")
    performance = relationship("Performance", back_populates="user", uselist=False)
    projects = relationship("Project", secondary=project_members, back_populates="members")

# ──────────────────────────────────────────────
# PROJECTS
# ──────────────────────────────────────────────
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String(100), nullable=True)  # "Game", "Software", etc.
    engine = Column(String(100), nullable=True)  # Unreal, Unity, etc.
    status = Column(Enum(ProjectStatus, name="project_status_enum"), default=ProjectStatus.ACTIVE)
    progress = Column(Float, default=0.0)  # 0 to 100
    deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    roles = relationship("Role", back_populates="project")
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    client = relationship("Client", back_populates="projects")
    members = relationship("User", secondary=project_members, back_populates="projects")
    activities = relationship("ProjectActivity", back_populates="project", cascade="all, delete-orphan")


class ProjectActivity(Base):
    __tablename__ = "project_activities"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    action = Column(String(200), nullable=False)  # "Build Run Completed", "Merged PR", etc.
    target = Column(String(200), nullable=True)   # "core-gameplay-loop"
    user_name = Column(String(100), nullable=True) # "System" or "Arjun"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="activities")


# ──────────────────────────────────────────────
# CLIENTS
# ──────────────────────────────────────────────
class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(150), nullable=True)
    status = Column(Enum(ClientStatus, name="client_status_enum"), default=ClientStatus.ACTIVE)
    industry = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    projects = relationship("Project", back_populates="client")
    communications = relationship("ClientCommunication", back_populates="client", cascade="all, delete-orphan")


class ClientCommunication(Base):
    __tablename__ = "client_communications"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    title = Column(String(200), nullable=False)
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="communications")


# ──────────────────────────────────────────────
# ROLES / HUMAN RESOURCES
# ──────────────────────────────────────────────
class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    department = Column(String(100), nullable=True)
    status = Column(Enum(RoleStatus, name="role_status_enum"), default=RoleStatus.OPEN)
    slots_required = Column(Integer, default=1)
    slots_filled = Column(Integer, default=0)
    is_urgent = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="roles")
    applicants = relationship("Applicant", back_populates="role", cascade="all, delete-orphan")


class Applicant(Base):
    __tablename__ = "applicants"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    name = Column(String(150), nullable=False)
    stage = Column(String(100), default="HR Screening") # "HR Screening", "Technical Test", "Final Interview", "Offer"
    email = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role = relationship("Role", back_populates="applicants")


# ──────────────────────────────────────────────
# ATTENDANCE
# ──────────────────────────────────────────────
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in = Column(DateTime(timezone=True), nullable=True)
    check_out = Column(DateTime(timezone=True), nullable=True)
    date = Column(String(20), nullable=False)  # "YYYY-MM-DD"
    status = Column(String(20), default="present")  # "present" | "absent" | "half-day"

    # Relationships
    user = relationship("User", back_populates="attendance_records")


# ──────────────────────────────────────────────
# WORK LOGS
# ──────────────────────────────────────────────
class WorkLog(Base):
    __tablename__ = "work_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(20), nullable=False)  # "YYYY-MM-DD"
    tasks_completed = Column(Text, nullable=False)
    blockers = Column(Text, nullable=True)
    hours_worked = Column(Float, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="work_logs")


# ──────────────────────────────────────────────
# PERFORMANCE
# ──────────────────────────────────────────────
class Performance(Base):
    __tablename__ = "performance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    zone = Column(Enum(PerformanceZone, name="performance_zone_enum"), default=PerformanceZone.GREEN)
    score = Column(Float, default=100.0)  # 0–100
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="performance")
