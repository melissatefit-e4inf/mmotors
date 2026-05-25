from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.dossier import Dossier
from app.schemas.dossier import DossierCreate, DossierOut, DossierStatusUpdate

router = APIRouter(prefix="/dossiers", tags=["dossiers"])


@router.post("/", response_model=DossierOut, status_code=201)
def create_dossier(dossier_in: DossierCreate, db: Session = Depends(get_db)):
    dossier = Dossier(user_id=1, **dossier_in.model_dump())
    db.add(dossier)
    db.commit()
    db.refresh(dossier)
    return dossier


@router.get("/", response_model=List[DossierOut])
def list_dossiers(db: Session = Depends(get_db)):
    return db.query(Dossier).all()


@router.get("/{dossier_id}", response_model=DossierOut)
def get_dossier(dossier_id: int, db: Session = Depends(get_db)):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    return dossier


@router.patch("/{dossier_id}/status", response_model=DossierOut)
def update_status(
    dossier_id: int, update: DossierStatusUpdate, db: Session = Depends(get_db)
):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    dossier.status = update.status
    db.commit()
    db.refresh(dossier)
    return dossier