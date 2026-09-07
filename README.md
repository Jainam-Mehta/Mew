# Mew - Multi-Service SaaS Management Platform

A professional multi-tenant subscription management and IoT monitoring platform featuring a React frontend and a FastAPI backend with SQLite/SQLAlchemy, JWT authentication, and interactive Swagger documentation.

---

## 🏛️ Project Structure

```
Mew/
├── frontend/             # React 19 + Vite + Tailwind CSS dashboard application
│   ├── src/
│   │   ├── api/          # API client for backend communication
│   │   ├── components/   # UI components (MewIcon, SubscriptionRequired)
│   │   ├── context/      # Authentication context with JWT token management
│   │   └── pages/        # Login, UserDashboard, AdminDashboard, ServiceDetail
│   ├── package.json
│   └── vite.config.js    # Dev server with /api proxy to FastAPI
│
└── backend/              # FastAPI Python backend
    ├── app/
    │   ├── main.py       # FastAPI application entry point & CORS
    │   ├── config.py     # Application settings
    │   ├── database.py   # SQLAlchemy database connection & session
    │   ├── security.py   # Password hashing & JWT token validation
    │   ├── models/       # Database models (User, Service, Subscription, Sensor, Activity)
    │   ├── schemas/      # Pydantic schemas for request/response validation
    │   ├── routers/      # API endpoints (/auth, /services, /admin, /users)
    │   └── seed.py       # Database seeder for demo users, services, and telemetry
    ├── requirements.txt
    └── .env.example
```

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

- Frontend runs at: `http://localhost:5173`
- API calls to `/api` are automatically proxied to `http://127.0.0.1:8000`.

---

## 🔐 Default Credentials & Demo Accounts

The database automatically seeds the following accounts on first startup:

| Account | Email | Password | Access Level | Description |
|---|---|---|---|---|
| **Admin** | `admin@company.com` | `admin123` | Full Admin | System control, user management, metrics |
| **Demo User 1** | `user1@demo.com` | `demo` | IoT Telemetry only | Environmental cold storage telemetry engine |
| **Demo User 2** | `user2@demo.com` | `demo` | Telemetry + Diagnostics | Cold storage telemetry + Industrial machinery diagnostics |
| **Demo User 3** | `user3@demo.com` | `demo` | All Services | Full access to all 3 technical services |

---

## 🎯 Services Overview

1. **IoT Environmental Telemetry Engine** (`SRV-IOT-ENV-01`) - Smart Agriculture Cold Storage Monitoring (14 Sensors, Temperature & Humidity Telemetry)
2. **Industrial Machinery Diagnostics** (`SRV-IND-MACH-02`) - Industrial Equipment Analytics (Uptime & Equipment Telemetry)
3. **Edge Gateway & Device Orchestrator** (`SRV-EDGE-GW-03`) - IoT Device Management Platform (Device Connectivity & Fleet Telemetry)

---

## 📄 License
Proprietary - All rights reserved.
