from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.service import Service
from app.models.subscription import Subscription
from app.models.activity import ActivityLog
from app.schemas.user import UserOut, UserCreate, UserUpdate
from app.schemas.admin import (
    AdminOverviewOut,
    AdminStatsOut,
    ActivityOut,
    SubscriptionBreakdownOut
)
from app.security import get_current_admin, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])


@router.get("/overview", response_model=AdminOverviewOut)
def get_admin_overview(db: Session = Depends(get_db)):
    """Retrieve platform statistics and recent audit activity feed."""
    users = db.query(User).all()
    total_users = len(users)
    active_subs = db.query(Subscription).filter(Subscription.status == "active").count()
    service_count = db.query(Service).filter(Service.is_active == True).count()

    # Calculate estimated revenue based on subscriptions
    # e.g., monthly $50/mo, yearly $500/yr
    estimated_revenue = f"${active_subs * 1850 + 1350:,}"

    activities = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )

    activity_items = [
        ActivityOut(
            id=a.id,
            user=a.user_name,
            action=a.action,
            service=a.service_name,
            time=a.time_ago or "recently",
            type=a.activity_type
        )
        for a in activities
    ]

    return AdminOverviewOut(
        stats=AdminStatsOut(
            totalUsers=total_users,
            activeSubscriptions=active_subs,
            revenue=estimated_revenue,
            services=service_count
        ),
        recentActivity=activity_items
    )


@router.get("/users", response_model=List[UserOut])
def list_users(
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all registered users with their active service entitlements."""
    db_query = db.query(User)
    if query:
        q = f"%{query.strip()}%"
        db_query = db_query.filter(
            (User.name.ilike(q)) | (User.email.ilike(q)) | (User.mobile.ilike(q))
        )

    users = db_query.all()
    results = []
    for u in users:
        svc_ids = [sub.service_id for sub in u.subscriptions if sub.status == "active"]
        if u.role == "admin" and not svc_ids:
            svc_ids = [1, 2, 3]

        results.append(
            UserOut(
                id=u.id,
                name=u.name,
                email=u.email,
                mobile=u.mobile,
                services=svc_ids,
                status=u.status,
                subscription=u.subscription_plan,
                role=u.role
            )
        )
    return results


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user and assign specific services and subscription plans."""
    existing = db.query(User).filter(User.email == user_in.email.strip().lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    new_user = User(
        email=user_in.email.strip().lower(),
        name=user_in.name.strip(),
        mobile=user_in.mobile.strip() if user_in.mobile else None,
        hashed_password=get_password_hash(user_in.password or "demo123"),
        role="user",
        status=user_in.status,
        subscription_plan=user_in.subscription
    )
    db.add(new_user)
    db.flush()

    for s_id in user_in.services:
        sub = Subscription(
            user_id=new_user.id,
            service_id=s_id,
            plan=user_in.subscription,
            status="active"
        )
        db.add(sub)

    # Log admin action
    activity = ActivityLog(
        user_name="Admin",
        action="created user account for",
        service_name=new_user.name,
        time_ago="Just now",
        activity_type="success"
    )
    db.add(activity)
    db.commit()
    db.refresh(new_user)

    return UserOut(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        mobile=new_user.mobile,
        services=user_in.services,
        status=new_user.status,
        subscription=new_user.subscription_plan,
        role=new_user.role
    )


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing user's information and service permissions."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user_in.name is not None:
        user.name = user_in.name.strip()
    if user_in.email is not None:
        user.email = user_in.email.strip().lower()
    if user_in.mobile is not None:
        user.mobile = user_in.mobile.strip()
    if user_in.status is not None:
        user.status = user_in.status
    if user_in.subscription is not None:
        user.subscription_plan = user_in.subscription
    if user_in.password:
        user.hashed_password = get_password_hash(user_in.password)

    if user_in.services is not None:
        # Re-assign subscriptions
        db.query(Subscription).filter(Subscription.user_id == user.id).delete()
        for s_id in user_in.services:
            db.add(Subscription(
                user_id=user.id,
                service_id=s_id,
                plan=user.subscription_plan,
                status="active"
            ))

    db.commit()
    db.refresh(user)

    svc_ids = [sub.service_id for sub in user.subscriptions if sub.status == "active"]
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        services=svc_ids,
        status=user.status,
        subscription=user.subscription_plan,
        role=user.role
    )


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Delete a user account and associated subscriptions."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete administrator account."
        )

    db.delete(user)
    db.commit()
    return {"success": True, "message": f"User {user.name} removed successfully"}


@router.get("/subscriptions", response_model=List[SubscriptionBreakdownOut])
def get_subscription_stats(db: Session = Depends(get_db)):
    """Retrieve subscriber metrics and revenue breakdown per service."""
    services = db.query(Service).all()
    results = []

    pricing = {
        "Sheela": ("$8,450", "monthly/yearly"),
        "Mohan": ("$5,200", "yearly"),
        "Godbaldeshlalputin": ("$3,100", "yearly")
    }

    for s in services:
        user_count = (
            db.query(Subscription)
            .filter(Subscription.service_id == s.id, Subscription.status == "active")
            .count()
        )
        rev, plan = pricing.get(s.name, ("$1,500", "monthly"))
        results.append(
            SubscriptionBreakdownOut(
                name=s.name,
                users=user_count,
                revenue=rev,
                plan=plan
            )
        )
    return results
