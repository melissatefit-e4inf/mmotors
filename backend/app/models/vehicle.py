from sqlalchemy import Column, Integer, String, Float, Boolean, Enum
from app.core.database import Base
import enum


class VehicleType(str, enum.Enum):
    sale = "sale"
    rental = "rental"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    mileage = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    fuel_type = Column(String, nullable=False)
    vehicle_type = Column(Enum(VehicleType), default=VehicleType.sale)
    is_available = Column(Boolean, default=True)
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)