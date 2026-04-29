from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from auth import get_current_user, require_ceo

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("/", response_model=List[schemas.ClientOut])
def list_clients(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """List all clients. CEO only."""
    return db.query(models.Client).all()


@router.post("/", response_model=schemas.ClientOut, status_code=201)
def create_client(
    data: schemas.ClientCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Add a new client. CEO only."""
    client = models.Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/{client_id}", response_model=schemas.ClientOut)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Get a single client."""
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.patch("/{client_id}", response_model=schemas.ClientOut)
def update_client(
    client_id: int,
    data: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Update a client. CEO only."""
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=204)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_ceo)
):
    """Delete a client. CEO only."""
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
