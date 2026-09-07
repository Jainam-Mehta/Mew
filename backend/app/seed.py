import json
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.service import Service
from app.models.subscription import Subscription
from app.models.sensor import Sensor
from app.models.activity import ActivityLog
from app.security import get_password_hash


def seed_database(db: Session) -> None:
    """Populate default services, demo users, sensors, and audit logs if DB is empty."""
    # Check if database is already seeded
    if db.query(User).first() is not None:
        return

    # 1. Services
    services_data = [
        {
            "id": 1,
            "name": "IoT Environmental Telemetry Engine",
            "description": "High-Precision Cold Storage, Ambient Temperature & Multi-Zone Environmental Monitoring",
            "icon": "Thermometer",
            "color": "from-blue-500 to-blue-600",
            "stats": {"locations": 1, "sensors": 14, "online": 13, "service_code": "SRV-IOT-ENV-01", "uptime": "99.98%"}
        },
        {
            "id": 2,
            "name": "Industrial Machinery Diagnostics",
            "description": "Predictive Equipment Health, Vibration Telemetry, Machine Current & Thermal Diagnostics",
            "icon": "Box",
            "color": "from-purple-500 to-purple-600",
            "stats": {"devices": 8, "uptime": "99.4%", "alerts": 2, "service_code": "SRV-IND-MACH-02"}
        },
        {
            "id": 3,
            "name": "Edge Gateway & Device Orchestrator",
            "description": "Distributed IoT Gateway Fleet Management, Mesh Routing, Telemetry Routing & Firmware OTA",
            "icon": "Cpu",
            "color": "from-green-500 to-green-600",
            "stats": {"devices": 24, "connected": 22, "data": "1.2GB", "service_code": "SRV-EDGE-GW-03", "uptime": "99.91%"}
        }
    ]

    for s in services_data:
        service = Service(
            id=s["id"],
            name=s["name"],
            description=s["description"],
            icon=s["icon"],
            color=s["color"],
            stats_json=json.dumps(s["stats"]),
            is_active=True
        )
        db.add(service)
    db.flush()

    # 2. Sensors for IoT Environmental Telemetry Engine (Service 1)
    sensors_data = [
        {"service_id": 1, "location": "Server Room Section 1", "name": "Temp", "temperature": 28.1, "humidity": 63.6, "status": "offline", "last_seen": "18-Aug-26 11:41"},
        {"service_id": 1, "location": "Cold Storage Room A", "name": "Storage Sensor A1", "temperature": 3.8, "humidity": 87.2, "status": "online", "last_seen": "Just now"},
        {"service_id": 1, "location": "Cold Storage Room B", "name": "Deep Freeze B1", "temperature": -18.2, "humidity": 91.5, "status": "online", "last_seen": "1 min ago"},
        {"service_id": 1, "location": "Cold Storage Room C", "name": "Ambient Sensor C1", "temperature": 4.1, "humidity": 86.0, "status": "online", "last_seen": "Just now"},
        {"service_id": 1, "location": "Dispatch Dock North", "name": "Dock Monitor D1", "temperature": 12.4, "humidity": 70.8, "status": "online", "last_seen": "2 mins ago"},
        {"service_id": 1, "location": "Compressor Chamber 1", "name": "Chiller Thermal 01", "temperature": 18.9, "humidity": 55.3, "status": "online", "last_seen": "Just now"},
    ]

    for s_item in sensors_data:
        sensor = Sensor(
            service_id=s_item["service_id"],
            location=s_item["location"],
            name=s_item["name"],
            temperature=s_item["temperature"],
            humidity=s_item["humidity"],
            status=s_item["status"],
            last_seen=s_item["last_seen"]
        )
        db.add(sensor)

    # 3. Users
    users_data = [
        {
            "email": "admin@company.com",
            "name": "Admin",
            "mobile": "+91 90904 80044",
            "password": "admin123",
            "role": "admin",
            "plan": "yearly",
            "services": [1, 2, 3]
        },
        {
            "email": "user1@demo.com",
            "name": "Rajesh Kumar",
            "mobile": "+91 98765 43210",
            "password": "demo",
            "role": "user",
            "plan": "monthly",
            "services": [1]
        },
        {
            "email": "user2@demo.com",
            "name": "Priya Sharma",
            "mobile": "+91 87654 32109",
            "password": "demo",
            "role": "user",
            "plan": "yearly",
            "services": [1, 2]
        },
        {
            "email": "user3@demo.com",
            "name": "Amit Patel",
            "mobile": "+91 76543 21098",
            "password": "demo",
            "role": "user",
            "plan": "yearly",
            "services": [1, 2, 3]
        }
    ]

    for u_item in users_data:
        user = User(
            email=u_item["email"],
            name=u_item["name"],
            mobile=u_item["mobile"],
            hashed_password=get_password_hash(u_item["password"]),
            role=u_item["role"],
            status="active",
            subscription_plan=u_item["plan"]
        )
        db.add(user)
        db.flush()

        for svc_id in u_item["services"]:
            sub = Subscription(
                user_id=user.id,
                service_id=svc_id,
                plan=u_item["plan"],
                status="active"
            )
            db.add(sub)

    # 4. Activity Logs
    activity_data = [
        {"user_name": "Rajesh Kumar", "action": "subscribed to", "service_name": "IoT Environmental Telemetry Engine", "time_ago": "2 hours ago", "activity_type": "success"},
        {"user_name": "Priya Sharma", "action": "renewed subscription for", "service_name": "Industrial Machinery Diagnostics", "time_ago": "5 hours ago", "activity_type": "success"},
        {"user_name": "Amit Patel", "action": "upgraded to access", "service_name": "Edge Gateway & Device Orchestrator", "time_ago": "1 day ago", "activity_type": "success"},
    ]

    for act in activity_data:
        log = ActivityLog(
            user_name=act["user_name"],
            action=act["action"],
            service_name=act["service_name"],
            time_ago=act["time_ago"],
            activity_type=act["activity_type"]
        )
        db.add(log)

    db.commit()
