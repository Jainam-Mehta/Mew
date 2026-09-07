# 🎭 Demo Users Documentation

## Overview

The platform includes 3 pre-configured demo users with different service access levels for easy testing and demonstration.

---

## 🔐 Demo User Credentials

### User 1: Rajesh Kumar
- **Email**: `user1@demo.com`
- **Password**: Any (e.g., `user123`, `demo`)
- **Mobile**: +91 98765 43210
- **Access Level**: Basic
- **Subscribed Services**: 
  - ✅ **IoT Environmental Telemetry Engine** (Service 1)
  - ❌ Industrial Machinery Diagnostics (Service 2 - Locked/Requires Subscription)
  - ❌ Edge Gateway & Device Orchestrator (Service 3 - Locked/Requires Subscription)
- **Subscription Plan**: Monthly
- **Status**: Active

**Use Case**: Demonstrates basic user with single service access (Cold Storage & Ambient Environmental Monitoring)

---

### User 2: Priya Sharma
- **Email**: `user2@demo.com`
- **Password**: Any (e.g., `user123`, `demo`)
- **Mobile**: +91 87654 32109
- **Access Level**: Intermediate
- **Subscribed Services**:
  - ✅ **IoT Environmental Telemetry Engine** (Service 1)
  - ✅ **Industrial Machinery Diagnostics** (Service 2)
  - ❌ Edge Gateway & Device Orchestrator (Service 3 - Locked)
- **Subscription Plan**: Yearly
- **Status**: Active

**Use Case**: Demonstrates user with multiple services (Cold Storage + Machinery Predictive Analytics)

---

### User 3: Amit Patel
- **Email**: `user3@demo.com`
- **Password**: Any (e.g., `user123`, `demo`)
- **Mobile**: +91 76543 21098
- **Access Level**: Premium
- **Subscribed Services**:
  - ✅ **IoT Environmental Telemetry Engine** (Service 1)
  - ✅ **Industrial Machinery Diagnostics** (Service 2)
  - ✅ **Edge Gateway & Device Orchestrator** (Service 3)
- **Subscription Plan**: Yearly
- **Status**: Active

**Use Case**: Demonstrates premium enterprise user with full access to all 3 technical services

---

## 🔄 Service Access Matrix

| User | IoT Telemetry Engine (1) | Machinery Diagnostics (2) | Edge Gateway & Orchestrator (3) |
|------|:---:|:---:|:---:|
| **Rajesh Kumar** (`user1@demo.com`) | ✅ Active | 🔒 Inactive | 🔒 Inactive |
| **Priya Sharma** (`user2@demo.com`) | ✅ Active | ✅ Active | 🔒 Inactive |
| **Amit Patel** (`user3@demo.com`) | ✅ Active | ✅ Active | ✅ Active |

---

## 📊 Admin Dashboard Data

The admin dashboard reflects:

### User List:
- Rajesh Kumar (`user1@demo.com`) - `IoT Telemetry Engine`
- Priya Sharma (`user2@demo.com`) - `IoT Telemetry Engine`, `Machinery Diagnostics`
- Amit Patel (`user3@demo.com`) - `IoT Telemetry Engine`, `Machinery Diagnostics`, `Edge Orchestrator`

### Recent Activity Feed:
- Rajesh Kumar subscribed to `IoT Environmental Telemetry Engine`
- Priya Sharma renewed subscription for `Industrial Machinery Diagnostics`
- Amit Patel upgraded to access `Edge Gateway & Device Orchestrator`

### Service Breakdown:
- `IoT Environmental Telemetry Engine`: 3 users, $8,450
- `Industrial Machinery Diagnostics`: 2 users, $5,200
- `Edge Gateway & Device Orchestrator`: 1 user, $3,100

*(Admins can dynamically toggle individual service access for any user at any time from Admin > Subscriptions > User Subscription Entitlements).*
