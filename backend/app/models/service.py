from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # Technical service names (e.g. IoT Environmental Telemetry Engine)
    description = Column(String, nullable=False)
    icon = Column(String, default="Thermometer")
    color = Column(String, default="from-blue-500 to-blue-600")
    stats_json = Column(Text, default="{}")  # Serialized stats key-values
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sensors = relationship(
        "Sensor",
        back_populates="service",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    subscriptions = relationship(
        "Subscription",
        back_populates="service",
        cascade="all, delete-orphan"
    )
