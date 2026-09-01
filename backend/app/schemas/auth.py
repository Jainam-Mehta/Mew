from typing import Optional, List
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    mobile: Optional[str] = None


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    mobile: Optional[str] = None


class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    mobile: Optional[str] = None
    role: str
    status: str
    subscribedServices: List[int]
    subscription: Optional[str] = "monthly"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    isAdmin: bool
    user: UserProfile
