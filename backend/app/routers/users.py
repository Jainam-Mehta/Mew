from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.activity import ActivityLog
from app.security import get_current_user
from app.services.telemetry import telemetry_client

router = APIRouter(prefix="/api/users", tags=["Users"])


class ContactSalesRequest(BaseModel):
    service_id: int
    service_name: Optional[str] = None
    notes: Optional[str] = None


class AlarmThresholdRequest(BaseModel):
    min_temp: float
    max_temp: float
    min_humidity: float
    max_humidity: float
    email_alerts: bool = True
    whatsapp_alerts: bool = True
    alert_phone: Optional[str] = None
    alert_email: Optional[str] = None


# In-memory storage for user alarm preferences (falls back gracefully)
_USER_ALARM_SETTINGS: Dict[int, Dict[str, Any]] = {}


@router.post("/contact-sales")
def contact_sales(
    request: ContactSalesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log an upgrade request from a user wanting access to a locked service."""
    activity = ActivityLog(
        user_name=current_user.name,
        action="requested upgrade for",
        service_name=request.service_name or f"Service {request.service_id}",
        time_ago="Just now",
        activity_type="info",
    )
    db.add(activity)
    db.commit()

    return {
        "success": True,
        "message": f"Upgrade inquiry received for {request.service_name or 'service'}. Our sales team will reach out to {current_user.email} shortly.",
    }


@router.get("/me/profile")
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Retrieve the full user profile aligned with Mew organization schema."""
    cloud_profile = telemetry_client.get_user_profile()

    return {
        "user_id": current_user.id,
        "user_name": cloud_profile.get("user_name") or current_user.name,
        "email": current_user.email,
        "client_email": cloud_profile.get("client_email") or current_user.email,
        "contact_no": current_user.mobile or cloud_profile.get("contact_no") or "+91 9819393688",
        "credit": cloud_profile.get("credit", 100.0),
        "renewal_date": cloud_profile.get("renewal_date") or "13-July-2027",
        "dashboard_type": "Temperature & Humidity",
        "role": current_user.role,
        "status": current_user.status,
        "plan": current_user.subscription_plan or "yearly",
        "temp_meters": cloud_profile.get("temp_meters") or [
            {
                "id": 2696,
                "location_name": "Server Room Section 1",
                "sensor_id": 225,
                "sensor_name": "Temp",
                "shift_time": "00:00:00",
            }
        ],
        "company_name": "Mew Telematics & Cold Chain Solutions",
    }


@router.get("/me/telemetry")
def get_my_telemetry(
    meter_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
):
    """Retrieve live sensor telemetry directly from Mew cloud telemetry stream."""
    telemetry = telemetry_client.get_latest_telemetry(meter_id=meter_id)
    return telemetry


@router.get("/me/alarms")
def get_user_alarms(current_user: User = Depends(get_current_user)):
    """Retrieve configured alarm thresholds and active alarms list."""
    defaults = {
        "min_temp": 1.0,
        "max_temp": 28.0,
        "min_humidity": 1.0,
        "max_humidity": 85.0,
        "email_alerts": True,
        "whatsapp_alerts": True,
        "alert_phone": current_user.mobile or "+91 90904 80044",
        "alert_email": current_user.email,
    }
    user_config = _USER_ALARM_SETTINGS.get(current_user.id, defaults)

    # Sample historical alarms for the user's sensor
    alarms_list = [
        {
            "id": "ALM-1029",
            "sensor": "Temp (Server Room Section 1)",
            "type": "Offline Status",
            "severity": "high",
            "time": "31-Aug-2026 19:14",
            "status": "Acknowledged",
            "acknowledged_by": "Facility Manager",
            "value": "Gateway signal timed out",
        },
        {
            "id": "ALM-1014",
            "sensor": "Temp (Server Room Section 1)",
            "type": "Temperature Warning",
            "severity": "warning",
            "time": "28-Aug-2026 14:32",
            "status": "Resolved",
            "acknowledged_by": "Auto Resolved",
            "value": "24.8 °C (Limit: 25.0 °C)",
        },
    ]

    return {"settings": user_config, "alarms": alarms_list}


@router.post("/me/alarms")
def update_user_alarms(
    request: AlarmThresholdRequest,
    current_user: User = Depends(get_current_user),
):
    """Update threshold limits and contact settings."""
    _USER_ALARM_SETTINGS[current_user.id] = request.model_dump()
    return {
        "success": True,
        "message": "Alarm thresholds updated successfully.",
        "settings": _USER_ALARM_SETTINGS[current_user.id],
    }


@router.get("/me/reports")
def get_telemetry_reports(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(get_current_user),
):
    """Generate telemetry log rows for analysis and reporting."""
    telemetry = telemetry_client.get_latest_telemetry()
    current_temp = 22.5
    current_hum = 63.2
    if telemetry.get("sensors"):
        s0 = telemetry["sensors"][0]
        current_temp = s0.get("temperature", 22.5)
        current_hum = s0.get("humidity", 63.2)

    rows = []
    base_time = datetime.now()
    # Generate daily aggregate logs
    for d in range(days):
        day_date = base_time - timedelta(days=d)
        date_str = day_date.strftime("%d-%b-%Y")
        rows.append(
            {
                "date": date_str,
                "sensor_name": "Temp",
                "location": "Server Room Section 1",
                "avg_temp": round(current_temp + ((d % 3) * 0.4) - 0.2, 1),
                "min_temp": round(current_temp - 1.8, 1),
                "max_temp": round(current_temp + 2.1, 1),
                "avg_humidity": round(current_hum + ((d % 2) * 1.2) - 0.6, 1),
                "uptime_percent": 98.5 if d > 0 else 92.0,
                "alerts_triggered": 1 if d == 7 else 0,
            }
        )

    return {
        "meter_id": 225,
        "sensor_name": "Temp",
        "location": "Server Room Section 1",
        "days": days,
        "records": rows,
    }


# In-memory tickets store (synchronized with session)
USER_TICKETS = [
    {
        "id": "TCK-2026-1042",
        "ticket_number": "TCK-2026-1042",
        "subject": "Sensor Offline Alert - Server Room Section 1",
        "category": "Hardware & Gateway",
        "meter_id": "225",
        "meter_name": "Temp",
        "priority": "High",
        "description": "Gateway has stopped transmitting heartbeat packets since 31-Aug-2026 19:14. Needs physical connection inspection.",
        "status": "In Progress",
        "created_at": "01-Sep-2026 09:30",
        "updated_at": "02-Sep-2026 11:15",
        "satisfaction_rating": None
    },
    {
        "id": "TCK-2026-0988",
        "ticket_number": "TCK-2026-0988",
        "subject": "Monthly Temperature Calibration Certificate Request",
        "category": "Calibration",
        "meter_id": "225",
        "meter_name": "Temp",
        "priority": "Medium",
        "description": "NIST calibration certificate required for annual ISO 9001 audit compliance documentation.",
        "status": "Resolved",
        "created_at": "24-Aug-2026 14:10",
        "updated_at": "26-Aug-2026 16:40",
        "satisfaction_rating": 5
    }
]


@router.get("/me/tickets")
def get_user_tickets(
    status: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Retrieve all tickets raised by user matching Mew support ticketing."""
    tickets = USER_TICKETS
    if status and status.lower() != "all":
        status_clean = status.lower().replace("-", " ")
        tickets = [
            t for t in tickets 
            if status_clean in t["status"].lower()
        ]
    return {
        "status": "success",
        "count": len(tickets),
        "list_of_complaints": tickets
    }


@router.post("/me/tickets")
def create_user_ticket(
    payload: dict,
    user: User = Depends(get_current_user)
):
    """Raise a new support ticket / complaint matching Mew support ticketing."""
    import random
    ticket_num = f"TCK-2026-{random.randint(1100, 9999)}"
    now_str = datetime.now().strftime("%d-%b-%Y %H:%M")
    
    new_ticket = {
        "id": ticket_num,
        "ticket_number": ticket_num,
        "subject": payload.get("subject", "Sensor Inquiry"),
        "category": payload.get("category", "Technical Support"),
        "meter_id": str(payload.get("meter_id", "225")),
        "meter_name": payload.get("meter_name", "Temp"),
        "priority": payload.get("priority", "Medium"),
        "description": payload.get("description", ""),
        "status": "Open",
        "created_at": now_str,
        "updated_at": now_str,
        "satisfaction_rating": None
    }
    USER_TICKETS.insert(0, new_ticket)
    return {
        "status": "success",
        "message": "Complaint Registered Successfully!!",
        "ticket": new_ticket
    }


@router.patch("/me/tickets/{ticket_id}/close")
@router.post("/me/tickets/{ticket_id}/close")
def close_user_ticket(
    ticket_id: str,
    payload: Optional[dict] = None,
    user: User = Depends(get_current_user)
):
    """Close an open ticket and record closure satisfaction feedback."""
    for t in USER_TICKETS:
        if t["id"] == ticket_id or t["ticket_number"] == ticket_id:
            t["status"] = "Closed"
            t["updated_at"] = datetime.now().strftime("%d-%b-%Y %H:%M")
            if payload and "satisfaction_rating" in payload:
                t["satisfaction_rating"] = payload["satisfaction_rating"]
            return {
                "status": "success",
                "message": "Ticket Closed Successfully",
                "ticket": t
            }
    raise HTTPException(status_code=404, detail="Ticket not found")


# In-memory user webhook store with persistent defaults
USER_WEBHOOKS_CONFIG = {
    "slack_webhook_url": "",  # Configure your Slack webhook URL here
    "discord_webhook_url": "",
    "custom_webhook_url": "",
    "custom_webhook_secret": "whsec_live_mew_92a54735",
    "email_alerts_enabled": True,
    "sms_alerts_enabled": True,
    "alert_email_recipient": "alerts@company.com",
    "alert_phone_recipient": "+91 90904 80044",
    "events": {
        "temp_threshold": True,
        "humidity_threshold": True,
        "sensor_offline": True,
        "device_reconnected": True,
        "daily_summary": False
    }
}


@router.get("/me/webhooks")
def get_user_webhooks(user: User = Depends(get_current_user)):
    """Retrieve user webhook integrations and alerting configuration."""
    cfg = dict(USER_WEBHOOKS_CONFIG)
    if not cfg.get("alert_email_recipient") or cfg["alert_email_recipient"] == "alerts@company.com":
        cfg["alert_email_recipient"] = user.email
    return {
        "status": "success",
        "webhooks": cfg
    }


@router.post("/me/webhooks")
def update_user_webhooks(
    payload: dict,
    user: User = Depends(get_current_user)
):
    """Save user webhook integrations and alerting configuration."""
    USER_WEBHOOKS_CONFIG.update(payload)
    return {
        "status": "success",
        "message": "Alerting and webhook preferences updated successfully.",
        "webhooks": USER_WEBHOOKS_CONFIG
    }


@router.post("/me/test-alert")
def dispatch_test_alert(
    payload: Optional[dict] = None,
    user: User = Depends(get_current_user)
):
    """Dispatch simulated test alert across configured webhook and email channels."""
    target_channel = payload.get("channel", "all") if payload else "all"
    return {
        "status": "success",
        "message": f"Test alert dispatched successfully via {target_channel.upper()}!",
        "payload": {
            "event": "system.test_alert",
            "timestamp": datetime.now().isoformat(),
            "sensor": "Server Room Section 1 - Temp",
            "reading": "28.5°C",
            "threshold": "28.0°C",
            "severity": "CRITICAL",
            "user": user.email
        }
    }


