from typing import List
from pydantic import BaseModel


class ActivityOut(BaseModel):
    id: int
    user: str
    action: str
    service: str
    time: str
    type: str

    class Config:
        from_attributes = True


class AdminStatsOut(BaseModel):
    totalUsers: int
    activeSubscriptions: int
    revenue: str
    services: int


class SubscriptionBreakdownOut(BaseModel):
    name: str
    users: int
    revenue: str
    plan: str


class LiveUserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    status: str
    city: str
    region: str
    lat: float
    lng: float
    is_active: bool = True
    last_active: str = "Just now"
    active_services_count: int = 1
    services: List[str] = []


class AdminOverviewOut(BaseModel):
    stats: AdminStatsOut
    recentActivity: List[ActivityOut]
    liveUsers: List[LiveUserOut] = []


class UserSubscriptionToggleRequest(BaseModel):
    user_id: int
    service_id: int
    is_active: bool


class UserSubscriptionItem(BaseModel):
    service_id: int
    service_name: str
    is_active: bool
    plan: str


class UserSubscriptionMatrixOut(BaseModel):
    user_id: int
    user_name: str
    email: str
    role: str
    status: str
    subscriptions: List[UserSubscriptionItem]
