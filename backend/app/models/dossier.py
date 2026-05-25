from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class DossierStatus(str, enum.Enum):
    pending = "pending"
    validated = "validated"
    refused = "refused"


class DossierType(str, enum.Enum):
    purchase = "purchase"
    rental = "rental"


class Dossier(Base):
    __tablename__ = "dossiers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    dossier_type = Column(Enum(DossierType), nullable=False)
    status = Column(Enum(DossierStatus), default=DossierStatus.pending)
    document_path = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    vehicle = relationship("Vehicle")