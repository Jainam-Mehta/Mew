from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class SensorOut(BaseModel):
    id: int
    location: str
    name: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    status: str
    lastSeen: Optional[str] = None
    is_enabled: bool = True

    class Config:
        from_attributes = True


class ServiceOut(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    color: str
    stats: Dict[str, Any]
    is_accessible: bool = False

    class Config:
        from_attributes = True


class ServiceDetailOut(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    color: str
    is_accessible: bool
    totalLocation: int
    totalSensor: int
    sensorOnline: int
    sensorOffline: int
    sensors: List[SensorOut]
