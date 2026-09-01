import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.service import Service
from app.models.sensor import Sensor
from app.models.user import User
from app.schemas.service import ServiceOut, ServiceDetailOut, SensorOut
from app.security import oauth2_scheme, decode_access_token

router = APIRouter(prefix="/api/services", tags=["Services"])


def _get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return db.query(User).filter(User.email == payload["sub"]).first()


@router.get("", response_model=List[ServiceOut])
def get_services(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(_get_optional_user)
):
    """List all available services and mark accessibility based on user subscriptions."""
    services = db.query(Service).filter(Service.is_active == True).all()

    accessible_ids = set()
    if user:
        if user.role == "admin":
            accessible_ids = {s.id for s in services}
        else:
            accessible_ids = {
                sub.service_id for sub in user.subscriptions if sub.status == "active"
            }

    result = []
    for s in services:
        stats = {}
        try:
            stats = json.loads(s.stats_json)
        except Exception:
            pass

        result.append(
            ServiceOut(
                id=s.id,
                name=s.name,
                description=s.description,
                icon=s.icon,
                color=s.color,
                stats=stats,
                is_accessible=(s.id in accessible_ids)
            )
        )
    return result


@router.get("/{service_id}", response_model=ServiceOut)
def get_service_by_id(
    service_id: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(_get_optional_user)
):
    """Retrieve details for a specific service."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    is_accessible = False
    if user:
        if user.role == "admin":
            is_accessible = True
        else:
            is_accessible = any(
                sub.service_id == service_id and sub.status == "active"
                for sub in user.subscriptions
            )

    stats = {}
    try:
        stats = json.loads(service.stats_json)
    except Exception:
        pass

    return ServiceOut(
        id=service.id,
        name=service.name,
        description=service.description,
        icon=service.icon,
        color=service.color,
        stats=stats,
        is_accessible=is_accessible
    )


@router.get("/{service_id}/data", response_model=ServiceDetailOut)
def get_service_telemetry(
    service_id: int,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(_get_optional_user)
):
    """Retrieve live telemetry and sensor metrics for a subscribed service."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )

    is_accessible = False
    if user:
        if user.role == "admin":
            is_accessible = True
        else:
            is_accessible = any(
                sub.service_id == service_id and sub.status == "active"
                for sub in user.subscriptions
            )

    sensors = db.query(Sensor).filter(Sensor.service_id == service_id).all()
    sensor_items = [
        SensorOut(
            id=s.id,
            location=s.location,
            name=s.name,
            temperature=s.temperature,
            humidity=s.humidity,
            status=s.status,
            lastSeen=s.last_seen
        )
        for s in sensors
    ]

    total_sensors = len(sensor_items)
    online_count = sum(1 for s in sensor_items if s.status == "online")
    offline_count = total_sensors - online_count
    distinct_locations = len({s.location for s in sensor_items}) or 1

    return ServiceDetailOut(
        id=service.id,
        name=service.name,
        description=service.description,
        icon=service.icon,
        color=service.color,
        is_accessible=is_accessible,
        totalLocation=distinct_locations,
        totalSensor=total_sensors,
        sensorOnline=online_count,
        sensorOffline=offline_count,
        sensors=sensor_items
    )
