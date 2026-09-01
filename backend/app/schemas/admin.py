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


class AdminOverviewOut(BaseModel):
    stats: AdminStatsOut
    recentActivity: List[ActivityOut]
