from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    mobile = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # "admin", "user"
    status = Column(String, default="active")  # "active", "inactive"
    subscription_plan = Column(String, default="monthly")  # "monthly", "yearly"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    subscriptions = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="joined"
    )
