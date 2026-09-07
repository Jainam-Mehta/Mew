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
    SubscriptionBreakdownOut,
    LiveUserOut,
    UserSubscriptionToggleRequest,
    UserSubscriptionItem,
    UserSubscriptionMatrixOut
)
from app.security import get_current_admin, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])

REGIONAL_LOCATIONS = [
    {"city": "Pune", "region": "HQ & Cold Chain Hub (MH, IN)", "lat": 18.5204, "lng": 73.8567},
    {"city": "Mumbai", "region": "Western Logistics Terminal (MH, IN)", "lat": 19.0760, "lng": 72.8777},
    {"city": "Bengaluru", "region": "Tech & Sensor Analytics Lab (KA, IN)", "lat": 12.9716, "lng": 77.5946},
    {"city": "New Delhi", "region": "North Operations Gateway (NCR, IN)", "lat": 28.6139, "lng": 77.2090},
    {"city": "Hyderabad", "region": "Pharma Cold Chain Depot (TS, IN)", "lat": 17.3850, "lng": 78.4867},
    {"city": "Chennai", "region": "Maritime Cargo Port (TN, IN)", "lat": 13.0827, "lng": 80.2707},
]


@router.get("/overview", response_model=AdminOverviewOut)
def get_admin_overview(db: Session = Depends(get_db)):
    """Retrieve platform statistics, active live users geo-telemetry, and recent audit activity feed."""
    users = db.query(User).all()
    total_users = len(users)
    active_subs = db.query(Subscription).filter(Subscription.status == "active").count()
    service_count = db.query(Service).filter(Service.is_active == True).count()

    # Calculate estimated revenue based on subscriptions
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

    # Build live active users geo-telemetry for Admin Overview Map
    services_lookup = {s.id: s.name for s in db.query(Service).all()}
    live_users_list = []

    for idx, u in enumerate(users):
        loc = REGIONAL_LOCATIONS[idx % len(REGIONAL_LOCATIONS)]
        active_sub_services = [
            services_lookup.get(sub.service_id, f"Service #{sub.service_id}")
            for sub in u.subscriptions if sub.status == "active"
        ]
        if u.role == "admin" and not active_sub_services:
            active_sub_services = list(services_lookup.values())

        # Slight coordinate jitter so overlapping markers are distinctly visible
        jitter_lat = (idx * 0.015) - 0.02
        jitter_lng = (idx * 0.012) - 0.015

        live_users_list.append(
            LiveUserOut(
                id=u.id,
                name=u.name,
                email=u.email,
                role=u.role,
                status=u.status,
                city=loc["city"],
                region=loc["region"],
                lat=loc["lat"] + jitter_lat,
                lng=loc["lng"] + jitter_lng,
                is_active=(u.status == "active"),
                last_active="Active now" if idx % 2 == 0 else f"{idx * 3 + 2}m ago",
                active_services_count=len(active_sub_services),
                services=active_sub_services
            )
        )

    return AdminOverviewOut(
        stats=AdminStatsOut(
            totalUsers=total_users,
            activeSubscriptions=active_subs,
            revenue=estimated_revenue,
            services=service_count
        ),
        recentActivity=activity_items,
        liveUsers=live_users_list
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
        "IoT Environmental Telemetry Engine": ("$8,450", "monthly/yearly"),
        "Industrial Machinery Diagnostics": ("$5,200", "yearly"),
        "Edge Gateway & Device Orchestrator": ("$3,100", "yearly")
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


@router.get("/subscriptions/matrix", response_model=List[UserSubscriptionMatrixOut])
def get_user_subscriptions_matrix(db: Session = Depends(get_db)):
    """List all registered users with their granular service subscription statuses."""
    users = db.query(User).all()
    services = db.query(Service).all()
    matrix = []

    for u in users:
        user_subs = {
            sub.service_id: sub
            for sub in u.subscriptions
        }
        sub_items = []
        for s in services:
            existing_sub = user_subs.get(s.id)
            # Admin automatically has access or explicit active
            is_active = (existing_sub is not None and existing_sub.status == "active")
            if u.role == "admin" and not existing_sub:
                is_active = True
            
            sub_items.append(
                UserSubscriptionItem(
                    service_id=s.id,
                    service_name=s.name,
                    is_active=is_active,
                    plan=existing_sub.plan if existing_sub else u.subscription_plan or "monthly"
                )
            )

        matrix.append(
            UserSubscriptionMatrixOut(
                user_id=u.id,
                user_name=u.name,
                email=u.email,
                role=u.role,
                status=u.status,
                subscriptions=sub_items
            )
        )
    return matrix


@router.post("/subscriptions/toggle")
def toggle_user_subscription(
    payload: UserSubscriptionToggleRequest,
    db: Session = Depends(get_db)
):
    """Admin endpoint to activate or deactivate a specific service subscription for a user."""
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    service = db.query(Service).filter(Service.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id, Subscription.service_id == service.id)
        .first()
    )

    if payload.is_active:
        if not sub:
            sub = Subscription(
                user_id=user.id,
                service_id=service.id,
                plan=user.subscription_plan or "monthly",
                status="active"
            )
            db.add(sub)
        else:
            sub.status = "active"
    else:
        if sub:
            sub.status = "cancelled"

    # Audit log
    action_str = "activated" if payload.is_active else "deactivated"
    activity = ActivityLog(
        user_name="Admin",
        action=f"{action_str} subscription for",
        service_name=f"{service.name} ({user.name})",
        time_ago="Just now",
        activity_type="success" if payload.is_active else "warning"
    )
    db.add(activity)
    db.commit()

    return {
        "success": True,
        "message": f"Service '{service.name}' {action_str} for {user.name}",
        "user_id": user.id,
        "service_id": service.id,
        "is_active": payload.is_active
    }

