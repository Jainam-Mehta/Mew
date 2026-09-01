from typing import Optional, List
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: str
    mobile: Optional[str] = None
    status: str = "active"
    subscription: str = "monthly"


class UserCreate(UserBase):
    password: Optional[str] = "default123"
    services: List[int] = [1]


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    status: Optional[str] = None
    subscription: Optional[str] = None
    services: Optional[List[int]] = None
    password: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    mobile: Optional[str] = None
    services: List[int]
    status: str
    subscription: str
    role: str

    class Config:
        from_attributes = True
