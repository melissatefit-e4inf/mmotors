from pydantic import BaseModel
from datetime import date, datetime
from app.models.dossier import DossierStatus, DossierType


class DossierCreate(BaseModel):
    vehicle_id: int
    dossier_type: DossierType
    notes: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    total_price: float | None = None


class DossierOut(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    dossier_type: DossierType
    status: DossierStatus
    notes: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    total_price: float | None = None

    id_card_path: str | None = None
    proof_of_address_path: str | None = None
    income_proof_path: str | None = None

    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class DossierStatusUpdate(BaseModel):
    status: DossierStatus