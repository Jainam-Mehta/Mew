from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.database import Base


class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # general, security, iot, notifications
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
