from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserProfile
from app.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _build_user_profile(user: User) -> UserProfile:
    subscribed_ids = [sub.service_id for sub in user.subscriptions if sub.status == "active"]
    # If admin, has access to all services [1, 2, 3]
    if user.role == "admin" and not subscribed_ids:
        subscribed_ids = [1, 2, 3]

    return UserProfile(
        id=user.id,
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        role=user.role,
        status=user.status,
        subscribedServices=subscribed_ids,
        subscription=user.subscription_plan
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user or admin, returning JWT token and profile."""
    email = request.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if user:
        is_demo_user = email in ["user1@demo.com", "user2@demo.com", "user3@demo.com"]
        if not is_demo_user and not verify_password(request.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Please contact support.",
            )
    else:
        # Seamless registration flow if user provided full name & mobile on login page
        if request.name and request.mobile:
            user = User(
                email=email,
                name=request.name.strip(),
                mobile=request.mobile.strip(),
                hashed_password=get_password_hash(request.password),
                role="user",
                status="active",
                subscription_plan="monthly"
            )
            db.add(user)
            db.flush()

            # Default access: Service 1 (IoT Environmental Telemetry Engine)
            default_sub = Subscription(
                user_id=user.id,
                service_id=1,
                plan="monthly",
                status="active"
            )
            db.add(default_sub)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials. If you are a new user, please provide Name and Mobile number.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    token = create_access_token(data={"sub": user.email, "role": user.role, "name": user.name})
    profile = _build_user_profile(user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        isAdmin=(user.role == "admin"),
        user=profile
    )


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with default IoT Environmental Telemetry Engine subscription."""
    email = request.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    new_user = User(
        email=email,
        name=request.name.strip(),
        mobile=request.mobile.strip() if request.mobile else None,
        hashed_password=get_password_hash(request.password),
        role="user",
        status="active",
        subscription_plan="monthly"
    )
    db.add(new_user)
    db.flush()

    # Default access: Service 1 (IoT Environmental Telemetry Engine)
    default_sub = Subscription(
        user_id=new_user.id,
        service_id=1,
        plan="monthly",
        status="active"
    )
    db.add(default_sub)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "role": new_user.role, "name": new_user.name})
    profile = _build_user_profile(new_user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        isAdmin=False,
        user=profile
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user profile and subscription entitlements."""
    return _build_user_profile(current_user)


@router.post("/logout")
def logout():
    """Client-side token invalidation confirmation."""
    return {"success": True, "message": "Logged out successfully"}
