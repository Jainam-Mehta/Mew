from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed import seed_database
import app.models  # Ensure all SQLAlchemy models are registered
from app.routers import (
    auth_router,
    services_router,
    admin_router,
    users_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)

    # Seed initial users, services, and sensors if empty
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI Backend for Mew Multi-Tenant SaaS Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(services_router)
app.include_router(admin_router)
app.include_router(users_router)


@app.get("/")
def root():
    return {
        "platform": "Mew Multi-Service Management Platform",
        "status": "online",
        "docs": "/docs",
        "version": settings.VERSION
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "mew-backend"}
