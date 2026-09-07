# Service Names & Architecture Specification

## 🎯 Current Technical Service Names

The Mew platform strictly utilizes technical, enterprise-grade service naming across the entire stack (Database, Seed scripts, API Schemas, Routers, and React Frontend components):

---

### Service 1: **IoT Environmental Telemetry Engine**
- **Service Code**: `SRV-IOT-ENV-01`
- **Internal ID**: `1`
- **Port**: `8081`
- **Protocol / Ingest**: `MQTT v5.0 / Real-Time Time-Series Pipeline`
- **Description**: High-Precision Cold Storage, Ambient Temperature & Multi-Zone Environmental Monitoring
- **Default Port**: 8081
- **Icon**: `Thermometer`
- **Color**: Blue gradient (`from-blue-500 to-blue-600`)
- **Default Access**: Granted automatically upon new account creation (Default Service ID: 1)
- **Telemetry Specs**:
  - 1 Primary Facility Location
  - 14 Multi-Zone Environmental Sensors
  - Sampling Rate: 10s
  - 99.98% Service Uptime SLA

---

### Service 2: **Industrial Machinery Diagnostics**
- **Service Code**: `SRV-IND-MACH-02`
- **Internal ID**: `2`
- **Port**: `8082`
- **Protocol / Ingest**: `Modbus TCP / High-Frequency Edge Diagnostic Pipeline`
- **Description**: Predictive Equipment Health, Vibration Telemetry, Machine Current & Thermal Diagnostics
- **Icon**: `Box`
- **Color**: Purple gradient (`from-purple-500 to-purple-600`)
- **Default Access**: Requires administrator entitlement or active subscription
- **Telemetry Specs**:
  - 8 Monitored Heavy Industrial Machines
  - High-Frequency Vibration Limit: 4.5 mm/s
  - Sampling Rate: 5s
  - 99.42% Service Uptime SLA

---

### Service 3: **Edge Gateway & Device Orchestrator**
- **Service Code**: `SRV-EDGE-GW-03`
- **Internal ID**: `3`
- **Port**: `8083`
- **Protocol / Ingest**: `gRPC / Containerized Edge Orchestration / TLS 1.3`
- **Description**: Distributed IoT Gateway Fleet Management, Mesh Routing, Telemetry Routing & Firmware OTA
- **Icon**: `Cpu`
- **Color**: Green gradient (`from-green-500 to-green-600`)
- **Default Access**: Requires administrator entitlement or active subscription
- **Telemetry Specs**:
  - 24 Distributed Edge Nodes & Mesh Gateways
  - 22 Concurrently Connected Mesh Devices
  - Sampling Rate: 15s
  - Remote Firmware OTA Updates

---

## 🔒 Access Control Matrix

| User Account | Role | IoT Telemetry (1) | Machinery Diagnostics (2) | Edge Gateway (3) |
|---|---|:---:|:---:|:---:|
| `admin@company.com` | Administrator | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| `user1@demo.com` | User | ✅ Active | ❌ Disabled | ❌ Disabled |
| `user2@demo.com` | User | ✅ Active | ✅ Active | ❌ Disabled |
| `user3@demo.com` | User | ✅ Active | ✅ Active | ✅ Active |

*(Admins can dynamically toggle individual service access for any user at any time from Admin > Subscriptions > User Subscription Entitlements).*
