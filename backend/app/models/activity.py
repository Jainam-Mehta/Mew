from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, nullable=False)
    action = Column(String, nullable=False)  # e.g., "subscribed to", "renewed subscription for"
    service_name = Column(String, nullable=False)
    time_ago = Column(String, nullable=True)  # e.g., "2 hours ago"
    activity_type = Column(String, default="success")  # "success", "warning", "info"
    created_at = Column(DateTime, default=datetime.utcnow)
