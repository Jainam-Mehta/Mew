from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.activity import ActivityLog
from app.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


class ContactSalesRequest(BaseModel):
    service_id: int
    service_name: Optional[str] = None
    notes: Optional[str] = None


@router.post("/contact-sales")
def contact_sales(
    request: ContactSalesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log an upgrade request from a user wanting access to a locked service."""
    activity = ActivityLog(
        user_name=current_user.name,
        action="requested upgrade for",
        service_name=request.service_name or f"Service {request.service_id}",
        time_ago="Just now",
        activity_type="info"
    )
    db.add(activity)
    db.commit()

    return {
        "success": True,
        "message": f"Upgrade inquiry received for {request.service_name or 'service'}. Our sales team will reach out to {current_user.email} shortly."
    }
