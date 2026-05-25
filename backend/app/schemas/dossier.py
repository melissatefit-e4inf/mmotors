from pydantic import BaseModel
from app.models.dossier import DossierStatus, DossierType


class DossierCreate(BaseModel):
    vehicle_id: int
    dossier_type: DossierType
    notes: str | None = None


class DossierOut(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    dossier_type: DossierType
    status: DossierStatus
    notes: str | None = None

    model_config = {"from_attributes": True}


class DossierStatusUpdate(BaseModel):
    status: DossierStatus