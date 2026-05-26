from pydantic import BaseModel
from datetime import date
from app.models.dossier import DossierStatus, DossierType


class DossierCreate(BaseModel):
    vehicle_id  : int
    dossier_type: DossierType
    notes       : str | None = None
    start_date  : date | None = None
    end_date    : date | None = None
    total_price : float | None = None


class DossierOut(BaseModel):
    id          : int
    user_id     : int
    vehicle_id  : int
    dossier_type: DossierType
    status      : DossierStatus
    notes       : str | None = None
    start_date  : date | None = None
    end_date    : date | None = None
    total_price : float | None = None

    model_config = {"from_attributes": True}


class DossierStatusUpdate(BaseModel):
    status: DossierStatus