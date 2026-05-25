from pydantic import BaseModel
from app.models.vehicle import VehicleType


class VehicleCreate(BaseModel):
    brand: str
    model: str
    year: int
    mileage: int
    price: float
    fuel_type: str
    vehicle_type: VehicleType
    description: str | None = None


class VehicleOut(BaseModel):
    id: int
    brand: str
    model: str
    year: int
    mileage: int
    price: float
    fuel_type: str
    vehicle_type: VehicleType
    is_available: bool
    description: str | None = None

    model_config = {"from_attributes": True}


class VehicleUpdate(BaseModel):
    vehicle_type: VehicleType