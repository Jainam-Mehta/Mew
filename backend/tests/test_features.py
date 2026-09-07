import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- 1. Testing Admin Login ---")
admin_resp = client.post("/api/auth/login", json={"email": "admin@company.com", "password": "admin123"})
assert admin_resp.status_code == 200, f"Admin login failed: {admin_resp.text}"
admin_token = admin_resp.json()["access_token"]
admin_headers = {"Authorization": f"Bearer {admin_token}"}
print("Admin token obtained.")

print("\n--- 2. Testing Admin Overview with Live Users Map ---")
overview_resp = client.get("/api/admin/overview", headers=admin_headers)
assert overview_resp.status_code == 200, f"Overview failed: {overview_resp.text}"
overview_data = overview_resp.json()
print("Overview Stats:", overview_data["stats"])
assert "liveUsers" in overview_data, "liveUsers missing in overview"
print(f"Total live users on map: {len(overview_data['liveUsers'])}")
first_user = overview_data['liveUsers'][0]
print(f"Sample User: {first_user['name']} | City: {first_user['city']} | Lat: {first_user['lat']}, Lng: {first_user['lng']} | Services: {first_user['services']}")

print("\n--- 3. Testing Subscriptions Matrix & Per-User Toggle ---")
matrix_resp = client.get("/api/admin/subscriptions/matrix", headers=admin_headers)
assert matrix_resp.status_code == 200, f"Matrix failed: {matrix_resp.text}"
matrix_data = matrix_resp.json()
print(f"Total user subscription records: {len(matrix_data)}")
demo_user = next((u for u in matrix_data if "user1" in u["email"]), matrix_data[0])
print(f"Testing User: {demo_user['user_name']} ({demo_user['email']})")
print(f"Current Subscriptions: {[(s['service_name'], s['is_active']) for s in demo_user['subscriptions']]}")

# Toggle Service 2 for this user
toggle_resp = client.post("/api/admin/subscriptions/toggle", headers=admin_headers, json={
    "user_id": demo_user["user_id"],
    "service_id": 2,
    "is_active": True
})
assert toggle_resp.status_code == 200, f"Toggle failed: {toggle_resp.text}"
print("Toggle Result:", toggle_resp.json()["message"])

# Verify updated status
matrix_after = client.get("/api/admin/subscriptions/matrix", headers=admin_headers).json()
demo_user_after = next(u for u in matrix_after if u["user_id"] == demo_user["user_id"])
sub2 = next(s for s in demo_user_after["subscriptions"] if s["service_id"] == 2)
assert sub2["is_active"] == True, "Service 2 was not activated!"
print("Verification: Service 2 is now Active for this user!")

print("\n--- 4. Testing Service Operational Endpoints (Ping & Restart) ---")
ping_resp = client.get("/api/services/1/ping", headers=admin_headers)
assert ping_resp.status_code == 200, f"Ping failed: {ping_resp.text}"
print("Ping result:", ping_resp.json())

restart_resp = client.post("/api/services/1/restart", headers=admin_headers)
assert restart_resp.status_code == 200, f"Restart failed: {restart_resp.text}"
print("Restart result:", restart_resp.json()["message"])

print("\n--- 5. Testing User Webhooks & Alerting Preferences ---")
user_resp = client.post("/api/auth/login", json={"email": "user1@demo.com", "password": "user123"})
assert user_resp.status_code == 200, f"User login failed: {user_resp.text}"
user_token = user_resp.json()["access_token"]
user_headers = {"Authorization": f"Bearer {user_token}"}

get_wh_resp = client.get("/api/users/me/webhooks", headers=user_headers)
assert get_wh_resp.status_code == 200, f"Get webhooks failed: {get_wh_resp.text}"
print("Current user webhooks config:", get_wh_resp.json()["webhooks"]["alert_email_recipient"])

update_wh_resp = client.post("/api/users/me/webhooks", headers=user_headers, json={
    "slack_webhook_url": "https://hooks.slack.com/services/TEST/SLACK/HOOK",
    "alert_email_recipient": "operations@1accord.in"
})
assert update_wh_resp.status_code == 200
print("Updated user webhooks config.")

test_alert_resp = client.post("/api/users/me/test-alert", headers=user_headers, json={"channel": "slack"})
assert test_alert_resp.status_code == 200
print("Test Alert Response:", test_alert_resp.json()["message"])

print("\n ALL BACKEND TESTS PASSED CLEANLY!")
