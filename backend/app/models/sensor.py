from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    location = Column(String, nullable=False)
    name = Column(String, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    status = Column(String, default="online")  # "online", "offline"
    last_seen = Column(String, nullable=True)

    # Relationships
    service = relationship("Service", back_populates="sensors")
