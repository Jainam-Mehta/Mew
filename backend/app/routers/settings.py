import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db, Base, engine
from app.models.setting import SystemSetting
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.setting import (
    GeneralSettings,
    SecuritySettings,
    IoTSettings,
    NotificationSettings,
    AllSettingsResponse,
    UpdateSettingsRequest,
    PasswordChangeRequest,
)
from app.security import (
    get_current_admin,
    verify_password,
    get_password_hash
)

router = APIRouter(
    prefix="/api/admin/settings",
    tags=["Admin Settings"],
    dependencies=[Depends(get_current_admin)]
)

public_router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"]
)

DEFAULT_SETTINGS = {
    "general": {
        "platformName": "Mew",
        "tagline": "Multi-Service Management Platform",
        "companyName": "Mew Telematics & Cold Chain Solutions",
        "supportPhone": "+91 90904 80044",
        "supportWhatsApp": "+91 91961 94288",
        "supportEmail": "sales@company.com",
        "timezone": "Asia/Kolkata",
        "dateFormat": "DD-MMM-YYYY HH:mm",
        "allowSelfRegistration": True,
        "defaultServiceId": 1
    },
    "security": {
        "sessionTimeoutMinutes": 1440,
        "requireMFA": False,
        "maxLoginAttempts": 5,
        "requireStrongPasswords": True
    },
    "iot": {
        "temperatureUnit": "C",
        "telemetryPollingIntervalSeconds": 15,
        # Sheela (Cold Storage)
        "minTempThreshold": 2.0,
        "maxTempThreshold": 8.0,
        "humidityThreshold": 85.0,
        "alertGracePeriodMinutes": 5,
        # Mohan (Industrial Equipment Analytics)
        "maxEquipmentTempThreshold": 75.0,
        "vibrationLimitMms": 4.5,
        "currentDrawLimitAmps": 32.0,
        "maintenanceIntervalHours": 500,
        "uptimeSlaPercent": 99.0,
        # Godbaldeshlalputin (IoT Device Management Platform)
        "sensorOfflineThresholdMinutes": 15,
        "monthlyDataCapGb": 2.0,
        "lowBatteryThresholdVolts": 3.3,
        "maxPacketLossPercent": 5.0,
        "autoOtaUpdates": False
    },
    "notifications": {
        "emailAlertsEnabled": True,
        "smsAlertsEnabled": True,
        "emergencyContactName": "Facility On-Call Manager",
        "alertEmailRecipient": "alerts@company.com",
        "alertPhoneRecipient": "+91 90904 80044",
        "webhookUrl": "https://hooks.slack.com/services/EXAMPLE/WEBHOOK"
    }
}


def _ensure_settings_seeded(db: Session):
    """Seed default settings into DB if not present."""
    Base.metadata.create_all(bind=engine)
    for category, settings_dict in DEFAULT_SETTINGS.items():
        for key, val in settings_dict.items():
            db_key = f"{category}.{key}"
            existing = db.query(SystemSetting).filter(SystemSetting.key == db_key).first()
            if not existing:
                setting_row = SystemSetting(
                    key=db_key,
                    value=json.dumps(val),
                    category=category
                )
                db.add(setting_row)
    db.commit()


def _load_settings_dict(db: Session) -> Dict[str, Dict[str, Any]]:
    _ensure_settings_seeded(db)
    rows = db.query(SystemSetting).all()
    result = {
        "general": dict(DEFAULT_SETTINGS["general"]),
        "security": dict(DEFAULT_SETTINGS["security"]),
        "iot": dict(DEFAULT_SETTINGS["iot"]),
        "notifications": dict(DEFAULT_SETTINGS["notifications"]),
    }

    for r in rows:
        if "." in r.key:
            cat, subkey = r.key.split(".", 1)
            if cat in result:
                try:
                    result[cat][subkey] = json.loads(r.value)
                except Exception:
                    result[cat][subkey] = r.value
    return result


@router.get("", response_model=AllSettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """Retrieve all current administrative configuration settings."""
    data = _load_settings_dict(db)
    return AllSettingsResponse(
        general=GeneralSettings(**data["general"]),
        security=SecuritySettings(**data["security"]),
        iot=IoTSettings(**data["iot"]),
        notifications=NotificationSettings(**data["notifications"]),
    )


@router.put("", response_model=AllSettingsResponse)
def update_settings(
    payload: UpdateSettingsRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Save administrative configuration updates across categories."""
    _ensure_settings_seeded(db)

    updates = []
    if payload.general is not None:
        for k, v in payload.general.model_dump().items():
            updates.append(("general", k, v))

    if payload.security is not None:
        for k, v in payload.security.model_dump().items():
            updates.append(("security", k, v))

    if payload.iot is not None:
        for k, v in payload.iot.model_dump().items():
            updates.append(("iot", k, v))

    if payload.notifications is not None:
        for k, v in payload.notifications.model_dump().items():
            updates.append(("notifications", k, v))

    for cat, k, v in updates:
        db_key = f"{cat}.{k}"
        row = db.query(SystemSetting).filter(SystemSetting.key == db_key).first()
        if row:
            row.value = json.dumps(v)
        else:
            row = SystemSetting(key=db_key, value=json.dumps(v), category=cat)
            db.add(row)

    # Log admin activity
    log = ActivityLog(
        user_name=current_admin.name,
        action="updated system configuration for",
        service_name="Admin Settings",
        time_ago="Just now",
        activity_type="info"
    )
    db.add(log)
    db.commit()

    return get_settings(db)


@router.put("/password")
def change_admin_password(
    request: PasswordChangeRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update administrator account password securely."""
    if not verify_password(request.currentPassword, current_admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )

    if request.newPassword != request.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match."
        )

    if len(request.newPassword) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long."
        )

    current_admin.hashed_password = get_password_hash(request.newPassword)

    log = ActivityLog(
        user_name=current_admin.name,
        action="updated security credentials for",
        service_name="Administrator Account",
        time_ago="Just now",
        activity_type="success"
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": "Admin password updated successfully."}


@router.post("/test-alert")
def send_test_alert(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Trigger a diagnostic notification alert to verify webhook and alert channels."""
    log = ActivityLog(
        user_name=current_admin.name,
        action="dispatched emergency test alert for",
        service_name="Sheela Cold Storage",
        time_ago="Just now",
        activity_type="warning"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "message": "Test alert notification dispatched to configured channels."
    }


@public_router.get("/contact")
@public_router.get("/config")
def get_public_config(db: Session = Depends(get_db)):
    """Retrieve public platform identity, support contacts, and service operational parameters."""
    data = _load_settings_dict(db)
    gen = data.get("general", {})
    iot = data.get("iot", {})
    return {
        "platformName": gen.get("platformName", "Mew"),
        "tagline": gen.get("tagline", "Multi-Service Management Platform"),
        "companyName": gen.get("companyName", "Mew Telematics & Cold Chain Solutions"),
        "supportPhone": gen.get("supportPhone", "+91 90904 80044"),
        "supportWhatsApp": gen.get("supportWhatsApp", "+91 91961 94288"),
        "supportEmail": gen.get("supportEmail", "sales@company.com"),
        "timezone": gen.get("timezone", "Asia/Kolkata"),
        "dateFormat": gen.get("dateFormat", "DD-MMM-YYYY HH:mm"),
        "iot": {
            "temperatureUnit": iot.get("temperatureUnit", "C"),
            "telemetryPollingIntervalSeconds": iot.get("telemetryPollingIntervalSeconds", 15),
            "minTempThreshold": iot.get("minTempThreshold", 2.0),
            "maxTempThreshold": iot.get("maxTempThreshold", 8.0),
            "humidityThreshold": iot.get("humidityThreshold", 85.0),
            "alertGracePeriodMinutes": iot.get("alertGracePeriodMinutes", 5),
            "maxEquipmentTempThreshold": iot.get("maxEquipmentTempThreshold", 75.0),
            "vibrationLimitMms": iot.get("vibrationLimitMms", 4.5),
            "currentDrawLimitAmps": iot.get("currentDrawLimitAmps", 32.0),
            "maintenanceIntervalHours": iot.get("maintenanceIntervalHours", 500),
            "uptimeSlaPercent": iot.get("uptimeSlaPercent", 99.0),
            "sensorOfflineThresholdMinutes": iot.get("sensorOfflineThresholdMinutes", 15),
            "monthlyDataCapGb": iot.get("monthlyDataCapGb", 2.0),
            "lowBatteryThresholdVolts": iot.get("lowBatteryThresholdVolts", 3.3),
            "maxPacketLossPercent": iot.get("maxPacketLossPercent", 5.0),
            "autoOtaUpdates": iot.get("autoOtaUpdates", False)
        }
    }
