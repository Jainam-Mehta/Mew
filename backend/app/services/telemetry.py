import time
import uuid
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class TelemetryClient:
    """Client for synchronizing live sensors and account telemetry with the Mew Cloud Stream."""

    def __init__(self):
        self.api_url = settings.TELEMETRY_API_URL.rstrip("/")
        self.user_id = settings.TELEMETRY_USER_ID
        self.password = settings.TELEMETRY_PASSWORD
        self.default_meter_id = settings.TELEMETRY_DEFAULT_METER_ID
        self.device_id_key = str(uuid.uuid4())

        self._cached_token: Optional[str] = None
        self._token_fetched_at: float = 0
        self._token_ttl: float = 3600 * 12  # 12 hours cache
        self._cached_telemetry: Optional[Dict[str, Any]] = None
        self._last_telemetry_fetch: float = 0

    def _headers(self, token: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Origin": "https://dashboard.mew.app",
            "Referer": "https://dashboard.mew.app/",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return headers

    def authenticate(self, force_refresh: bool = False) -> Optional[str]:
        """Authenticate with cloud stream endpoint and return JWT/Bearer token."""
        now = time.time()
        if (
            not force_refresh
            and self._cached_token
            and (now - self._token_fetched_at < self._token_ttl)
        ):
            return self._cached_token

        login_url = f"{self.api_url}/user/react/login"
        payload = {
            "id": self.user_id,
            "password": self.password,
            "ip_address": "127.0.0.1",
            "device_id_key": self.device_id_key,
        }

        try:
            with httpx.Client(timeout=10.0, verify=False) as client:
                resp = client.post(
                    login_url,
                    data=payload,
                    headers={
                        **self._headers(),
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get("success") and data.get("token"):
                        self._cached_token = data["token"]
                        self._token_fetched_at = now
                        logger.info("Successfully authenticated with Mew Cloud API")
                        return self._cached_token
                    else:
                        logger.warning(f"Telemetry stream login failed: {data.get('msg')}")
                else:
                    logger.warning(f"Telemetry stream login returned HTTP {resp.status_code}")
        except Exception as e:
            logger.error(f"Error authenticating with Telemetry API: {e}")

        return self._cached_token

    def get_latest_telemetry(self, meter_id: Optional[int] = None) -> Dict[str, Any]:
        """Fetch live temperature & humidity telemetry from cloud stream."""
        now = time.time()
        # Return memory cached telemetry if fetched within last 5 seconds
        if self._cached_telemetry and (now - self._last_telemetry_fetch < 5.0):
            return self._cached_telemetry

        meter = meter_id or self.default_meter_id
        token = self.authenticate()

        fallback_data = {
            "source": "cache",
            "meter_id": meter,
            "total_locations": 1,
            "total_sensors": 1,
            "online_sensors": 0,
            "offline_sensors": 1,
            "sensors": [
                {
                    "id": meter,
                    "location": "Server Room Section 1",
                    "name": "Temp",
                    "temperature": 22.5,
                    "humidity": 63.2,
                    "status": "offline",
                    "lastSeen": "31-Aug-26 19:14",
                    "min_temp": 1.0,
                    "max_temp": 28.0,
                    "min_humidity": 1.0,
                    "max_humidity": 85.0,
                }
            ],
            "last_synced": "Live",
        }

        if not token:
            return fallback_data

        try:
            url = f"{self.api_url}/th_ms/get_latest_dashboard?meter_id={meter}"
            with httpx.Client(timeout=10.0, verify=False) as client:
                resp = client.get(url, headers=self._headers(token))

                if resp.status_code == 401:
                    # Token might have expired, refresh once
                    token = self.authenticate(force_refresh=True)
                    if token:
                        resp = client.get(url, headers=self._headers(token))

                if resp.status_code == 200:
                    raw = resp.json()
                    sensors = []
                    for s in raw.get("sensors", []):
                        sensors.append(
                            {
                                "id": s.get("sensor_id", meter),
                                "location": s.get("location", "Server Room Section 1"),
                                "name": s.get("sensor_name", "Temp"),
                                "temperature": s.get("temperature", 22.5),
                                "humidity": s.get("humidity", 63.2),
                                "status": (s.get("status") or "offline").lower(),
                                "lastSeen": s.get("last_seen", "31-Aug-26 19:14"),
                                "min_temp": s.get("temp_min_threshold", 1.0),
                                "max_temp": s.get("temp_max_threshold", 28.0),
                                "min_humidity": s.get("humidity_min_threshold", 1.0),
                                "max_humidity": s.get("humidity_max_threshold", 85.0),
                            }
                        )

                    result = {
                        "source": "live_telemetry",
                        "meter_id": meter,
                        "total_locations": raw.get("total_location", 1),
                        "total_sensors": raw.get("total", len(sensors)),
                        "online_sensors": raw.get("active", 0),
                        "offline_sensors": raw.get("inactive", len(sensors)),
                        "sensors": sensors or fallback_data["sensors"],
                        "last_synced": "Just now",
                    }
                    self._cached_telemetry = result
                    self._last_telemetry_fetch = now
                    return result
        except Exception as e:
            logger.error(f"Error fetching live telemetry: {e}")

        return fallback_data

    def get_user_profile(self) -> Dict[str, Any]:
        """Fetch full organization profile from cloud telemetry stream."""
        token = self.authenticate()
        fallback_profile = {
            "user_name": "Mew Telematics",
            "client_email": "operations@mew.io",
            "contact_no": "+91 90904 80044",
            "credit": 100.0,
            "renewal_date": "13-July-2027",
            "dashboard_type": "Temperature & Humidity",
            "temp_meters": [
                {
                    "id": 2696,
                    "location_name": "Server Room Section 1",
                    "sensor_id": 225,
                    "sensor_name": "Temp",
                    "shift_time": "00:00:00",
                }
            ],
            "company_name": "Mew Telematics & Cold Chain Solutions",
        }

        if not token:
            return fallback_profile

        try:
            url = f"{self.api_url}/user/profile"
            with httpx.Client(timeout=10.0, verify=False) as client:
                resp = client.get(url, headers=self._headers(token))
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "user_name": data.get("user_name") or "Mew Telematics",
                        "client_email": data.get("client_email") or "operations@mew.io",
                        "contact_no": data.get("contact_no") or "+91 90904 80044",
                        "credit": data.get("credit", 100.0),
                        "renewal_date": data.get("renewal_date") or "13-July-2027",
                        "dashboard_type": "Temperature & Humidity",
                        "temp_meters": data.get("temp_meters") or fallback_profile["temp_meters"],
                        "company_name": "Mew Telematics & Cold Chain Solutions",
                    }
        except Exception as e:
            logger.error(f"Error fetching organization profile: {e}")

        return fallback_profile


# Global singleton instance
telemetry_client = TelemetryClient()
