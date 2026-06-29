from pathlib import Path
from shutil import copyfileobj
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.dossier import Dossier
from app.models.user import User
from app.schemas.dossier import DossierCreate, DossierOut, DossierStatusUpdate

router = APIRouter(prefix="/dossiers", tags=["dossiers"])

UPLOAD_DIR = Path("uploads_justificatifs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}

MAX_FILE_SIZE = 5 * 1024 * 1024


def check_dossier_access(dossier: Dossier, current_user: User):
    if current_user.role.value != "admin" and dossier.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Accès refusé")


def save_upload_file(file: UploadFile, dossier_id: int, prefix: str) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Format invalide. Formats acceptés : PDF, JPG, PNG."
        )

    suffix = ALLOWED_CONTENT_TYPES[file.content_type]
    filename = f"dossier_{dossier_id}_{prefix}_{uuid4().hex}{suffix}"
    file_path = UPLOAD_DIR / filename

    size = 0

    with file_path.open("wb") as buffer:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)

            if size > MAX_FILE_SIZE:
                buffer.close()
                file_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=400,
                    detail="Fichier trop volumineux. Taille maximale : 5 Mo."
                )

            buffer.write(chunk)

    return str(file_path)


@router.post("/", response_model=DossierOut, status_code=201)
def create_dossier(
    dossier_in: DossierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dossier = Dossier(user_id=current_user.id, **dossier_in.model_dump())

    db.add(dossier)
    db.commit()
    db.refresh(dossier)

    return dossier


@router.get("/", response_model=List[DossierOut])
def list_dossiers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.value == "admin":
        return db.query(Dossier).all()

    return db.query(Dossier).filter(Dossier.user_id == current_user.id).all()


@router.get("/{dossier_id}", response_model=DossierOut)
def get_dossier(
    dossier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()

    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")

    check_dossier_access(dossier, current_user)

    return dossier


@router.patch("/{dossier_id}/status", response_model=DossierOut)
def update_status(
    dossier_id: int,
    update: DossierStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()

    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")

    dossier.status = update.status

    db.commit()
    db.refresh(dossier)

    return dossier


@router.patch("/{dossier_id}/documents", response_model=DossierOut)
def upload_documents(
    dossier_id: int,
    id_card: UploadFile = File(...),
    proof_of_address: UploadFile = File(...),
    income_proof: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dossier = db.query(Dossier).filter(Dossier.id == dossier_id).first()

    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")

    check_dossier_access(dossier, current_user)

    dossier.id_card_path = save_upload_file(id_card, dossier_id, "id_card")
    dossier.proof_of_address_path = save_upload_file(
        proof_of_address,
        dossier_id,
        "proof_of_address"
    )
    dossier.income_proof_path = save_upload_file(
        income_proof,
        dossier_id,
        "income_proof"
    )

    db.commit()
    db.refresh(dossier)

    return dossier