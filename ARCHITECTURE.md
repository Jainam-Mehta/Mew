# SaaS Platform - Architecture & Workflow

## 🏛️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Login Page   │  │ User Dashboard│  │Admin Dashboard│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                   │            │
│         └──────────────────┴───────────────────┘            │
│                           │                                 │
│                    React Router                             │
│                           │                                 │
│                   ┌───────▼────────┐                       │
│                   │  Auth Context  │                       │
│                   │  (State Mgmt)  │                       │
│                   └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Future: API Calls)
                            ▼
                   ┌────────────────┐
                   │  Backend API   │ (To be implemented)
                   └────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │    Database    │ (To be implemented)
                   └────────────────┘
```

## 🔄 User Flow Diagrams

### Login Flow

```
┌──────────┐
│  User    │
│ Arrives  │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────┐
│         Login Page                  │
│  ┌─────────────────────────────┐   │
│  │ Enter Email & Password      │   │
│  └─────────────┬───────────────┘   │
└────────────────┼───────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Is admin?      │
        │ Check email    │
        └───┬────────┬───┘
            │        │
    Yes     │        │     No
            ▼        ▼
    ┌───────────┐  ┌──────────────┐
    │  Admin    │  │ Require:     │
    │ Dashboard │  │ Name, Mobile │
    └───────────┘  └──────┬───────┘
                           │
                           ▼
                   ┌──────────────┐
                   │    User      │
                   │  Dashboard   │
                   └──────────────┘
```

### Service Access Flow

```
┌─────────────────────┐
│  User Dashboard     │
│                     │
│  ┌────────────┐    │
│  │ Service 1  │────┼──► Has subscription?
│  └────────────┘    │         │
└─────────────────────┘         │
                        ┌───────┴────────┐
                        │                │
                       Yes              No
                        │                │
                        ▼                ▼
            ┌──────────────────┐  ┌────────────────────┐
            │ Service Detail   │  │  Subscription      │
            │ Page             │  │  Required Screen   │
            │                  │  │                    │
            │ • Analytics      │  │  • Contact Info    │
            │ • Sensor Data    │  │  • Call to Action  │
            │ • Charts         │  │  • Back to Home    │
            └──────────────────┘  └────────────────────┘
```

### Admin Workflow

```
┌──────────────────────────────────────────┐
│         Admin Dashboard                   │
│                                           │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐│
│  │Overview │  │  Users  │  │ Subscr.  ││
│  └────┬────┘  └────┬────┘  └────┬─────┘│
└───────┼────────────┼────────────┼───────┘
        │            │            │
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌──────────┐
   │ Stats & │  │  Add/   │  │  Assign  │
   │Activity │  │  Edit   │  │ Services │
   │         │  │  Delete │  │  Manage  │
   │         │  │  Users  │  │  Billing │
   └─────────┘  └─────────┘  └──────────┘
```

## 🔐 Authentication Logic

### Current Implementation (Frontend Only)

```javascript
// 1. Admin Detection
if (email === 'admin@company.com' && password === 'admin123') {
  → Redirect to /admin
  → Full access to all features
}

// 2. Regular User
else if (email && password && name && mobile) {
  → Redirect to /dashboard
  → Access only subscribed services (default: Service 1)
}

// 3. Validation
else {
  → Show error message
}
```

### Future Backend Implementation

```javascript
// Recommended flow:
POST /api/auth/login
{
  email: string,
  password: string,
  name?: string,
  mobile?: string
}

Response:
{
  token: JWT,
  user: {
    id, name, email, role,
    subscribedServices: [1, 2, 3]
  }
}

// Then store token in localStorage/cookie
// Add token to all subsequent API calls
```

## 📊 Data Models (Recommended for Backend)

### User Model
```javascript
{
  id: UUID,
  name: String,
  email: String (unique),
  mobile: String,
  password: Hash,
  role: Enum['user', 'admin'],
  subscribedServices: Array[ServiceId],
  subscription: {
    type: Enum['monthly', 'yearly'],
    status: Enum['active', 'inactive', 'expired'],
    startDate: Date,
    endDate: Date,
    paymentStatus: Enum['paid', 'pending', 'failed']
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Service Model
```javascript
{
  id: Number,
  name: String,
  description: String,
  icon: String,
  features: Array[String],
  pricing: {
    monthly: Number,
    yearly: Number
  },
  status: Enum['active', 'inactive'],
  sensorCount?: Number,
  locations?: Array[Location],
  analytics: Array[AnalyticType]
}
```

### Subscription Model
```javascript
{
  id: UUID,
  userId: UUID,
  serviceId: Number,
  type: Enum['monthly', 'yearly'],
  status: Enum['active', 'cancelled', 'expired'],
  startDate: Date,
  endDate: Date,
  autoRenew: Boolean,
  paymentHistory: Array[Payment],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints (Recommended)

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user
PUT    /api/auth/password       - Change password
```

### Users (Admin Only)
```
GET    /api/users               - List all users
GET    /api/users/:id           - Get user details
POST   /api/users               - Create user
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
```

### Services
```
GET    /api/services            - List all services
GET    /api/services/:id        - Get service details
GET    /api/services/:id/data   - Get service sensor data
POST   /api/services            - Create service (admin)
PUT    /api/services/:id        - Update service (admin)
```

### Subscriptions
```
GET    /api/subscriptions                    - List user subscriptions
POST   /api/subscriptions                    - Create subscription
PUT    /api/subscriptions/:id                - Update subscription
DELETE /api/subscriptions/:id                - Cancel subscription
GET    /api/subscriptions/:id/analytics      - Get subscription analytics
```

## 🎨 Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── Login
│   │
│   ├── UserDashboard (Protected)
│   │   ├── Header
│   │   ├── StatsCards
│   │   ├── ServiceGrid
│   │   │   └── ServiceCard[]
│   │   └── HelpSection
│   │
│   ├── ServiceDetail (Protected)
│   │   ├── Header
│   │   ├── TabNavigation
│   │   ├── StatsCards
│   │   ├── SensorDataTable
│   │   └── AnalyticsCharts
│   │
│   ├── SubscriptionRequired
│   │   ├── MessageSection
│   │   ├── ContactOptions
│   │   └── Illustration
│   │
│   └── AdminDashboard (Protected + Admin Only)
│       ├── Header
│       ├── TabNavigation
│       ├── OverviewTab
│       │   ├── StatsGrid
│       │   └── ActivityFeed
│       ├── UsersTab
│       │   ├── UserTable
│       │   └── AddUserModal
│       ├── SubscriptionsTab
│       │   └── SubscriptionCards
│       └── SettingsTab
```

## 🔧 State Management

### AuthContext
```javascript
State:
  - user: Object | null
  - isAdmin: boolean

Methods:
  - login(email, password, name?, mobile?)
  - logout()

Storage:
  - localStorage: user, isAdmin
```

### Future State Needs
- Service data cache
- User preferences
- Notification state
- Real-time updates (WebSocket)

## 🚀 Deployment Checklist

### Before Production:
1. ✅ Replace hardcoded admin credentials with environment variables
2. ✅ Implement backend API
3. ✅ Add proper authentication (JWT)
4. ✅ Set up database
5. ✅ Add input validation and sanitization
6. ✅ Implement rate limiting
7. ✅ Add error logging and monitoring
8. ✅ Set up HTTPS
9. ✅ Add CORS configuration
10. ✅ Implement password reset
11. ✅ Add email verification
12. ✅ Set up payment gateway
13. ✅ Add data backup strategy
14. ✅ Implement proper error boundaries
15. ✅ Add loading states
16. ✅ Optimize bundle size
17. ✅ Add analytics tracking
18. ✅ Implement SEO optimizations
19. ✅ Add terms of service and privacy policy
20. ✅ Security audit

## 📈 Scalability Considerations

### Frontend
- Code splitting for routes
- Lazy loading for components
- Image optimization
- CDN for static assets

### Backend (Future)
- Load balancing
- Database indexing
- Caching layer (Redis)
- Message queue for async tasks
- Microservices architecture
- API rate limiting
- Horizontal scaling

## 🔒 Security Best Practices

1. **Never store passwords in plain text**
2. **Use HTTPS everywhere**
3. **Implement CSRF protection**
4. **Sanitize all user inputs**
5. **Use parameterized queries**
6. **Implement proper session management**
7. **Add rate limiting on sensitive endpoints**
8. **Regular security audits**
9. **Keep dependencies updated**
10. **Implement proper logging (no sensitive data)**

---

**Note**: This is a frontend prototype. Backend implementation is required for production use.
