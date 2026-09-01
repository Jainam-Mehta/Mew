# Mew Backend API (FastAPI)

Production-ready backend for the Mew Multi-Service SaaS Management Platform.

## 🚀 Key Features

- **FastAPI Framework**: High-performance, auto-documented asynchronous REST API.
- **SQLAlchemy 2.0 ORM**: Clean database modeling with SQLite (`mew.db`) out-of-the-box.
- **Argon2id & JWT Authentication**: Enterprise-grade password hashing with Argon2 and stateless JSON Web Tokens.
- **Auto-Seeding**: Automatically initializes Admin, Demo Users 1-3, Services (Sheela, Mohan, Godbaldeshlalputin), and Cold Storage IoT sensors.
- **Role-Based Access Control**: Strict segregation between `admin` and regular `user` roles.
- **Telemetry & Sensor API**: Live sensor readings, location statistics, and uptime metrics.
- **Admin Management Suite**: Full user provisioning, service subscription assignment, and activity audit feed.

---

## 🛠️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment** (Optional):
   ```bash
   copy .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

4. **Access Swagger UI Docs**:
   Navigate to [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticates with email & password, returns JWT token.
- `POST /api/auth/register`: Creates new user account with default Sheela access.
- `GET /api/auth/me`: Returns current user's profile and active service IDs.
- `POST /api/auth/logout`: Confirms client-side session termination.

### Services (`/api/services`)
- `GET /api/services`: Lists all platform services with accessibility status for current user.
- `GET /api/services/{id}`: Detailed service description and metadata.
- `GET /api/services/{id}/data`: Live IoT sensors telemetry and aggregate stats.

### Admin Suite (`/api/admin`) - *Admin role required*
- `GET /api/admin/overview`: Summary stats (users, active subscriptions, revenue) + audit activity log.
- `GET /api/admin/users`: Searchable list of all registered accounts.
- `POST /api/admin/users`: Provision a new user with custom service access.
- `PUT /api/admin/users/{id}`: Edit account information and update service entitlements.
- `DELETE /api/admin/users/{id}`: Remove account.
- `GET /api/admin/subscriptions`: Revenue breakdown per service.

### Users (`/api/users`)
- `POST /api/users/contact-sales`: Records user request to upgrade/subscribe to locked services.
