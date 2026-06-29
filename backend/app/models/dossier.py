from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Enum,
    DateTime,
    Date,
    Float,
)
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

    dossier_type = Column(
        Enum(DossierType, native_enum=False),
        nullable=False
    )

    status = Column(
        Enum(DossierStatus, native_enum=False),
        default=DossierStatus.pending,
        nullable=False
    )

    # Justificatifs
    id_card_path = Column(String, nullable=True)
    proof_of_address_path = Column(String, nullable=True)
    income_proof_path = Column(String, nullable=True)

    notes = Column(String, nullable=True)

    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    total_price = Column(Float, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship("User", back_populates="dossiers")
    vehicle = relationship("Vehicle", back_populates="dossiers")