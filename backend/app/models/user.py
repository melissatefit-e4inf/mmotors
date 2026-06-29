from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    client = "client"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)

    role = Column(
        Enum(UserRole, native_enum=False),
        default=UserRole.client,
        nullable=False
    )

    is_active = Column(Boolean, default=True)

    dossiers = relationship("Dossier", back_populates="user")