from typing import Optional
from pydantic import BaseModel


class GeneralSettings(BaseModel):
    platformName: str = "Mew"
    tagline: str = "Multi-Service Management Platform"
    companyName: str = "Mew Telematics & Cold Chain Solutions"
    supportPhone: str = "+91 90904 80044"
    supportWhatsApp: str = "+91 91961 94288"
    supportEmail: str = "sales@company.com"
    timezone: str = "Asia/Kolkata"
    dateFormat: str = "DD-MMM-YYYY HH:mm"
    allowSelfRegistration: bool = True
    defaultServiceId: int = 1


class SecuritySettings(BaseModel):
    sessionTimeoutMinutes: int = 1440
    requireMFA: bool = False
    maxLoginAttempts: int = 5
    requireStrongPasswords: bool = True


class IoTSettings(BaseModel):
    temperatureUnit: str = "C"  # "C" or "F"
    telemetryPollingIntervalSeconds: int = 15
    minTempThreshold: float = 2.0
    maxTempThreshold: float = 8.0
    humidityThreshold: float = 85.0
    alertGracePeriodMinutes: int = 5
    sensorOfflineThresholdMinutes: int = 15


class NotificationSettings(BaseModel):
    emailAlertsEnabled: bool = True
    smsAlertsEnabled: bool = True
    emergencyContactName: str = "Facility On-Call Manager"
    alertEmailRecipient: str = "alerts@company.com"
    alertPhoneRecipient: str = "+91 90904 80044"
    webhookUrl: str = "https://hooks.slack.com/services/EXAMPLE/WEBHOOK"


class AllSettingsResponse(BaseModel):
    general: GeneralSettings
    security: SecuritySettings
    iot: IoTSettings
    notifications: NotificationSettings


class UpdateSettingsRequest(BaseModel):
    general: Optional[GeneralSettings] = None
    security: Optional[SecuritySettings] = None
    iot: Optional[IoTSettings] = None
    notifications: Optional[NotificationSettings] = None


class PasswordChangeRequest(BaseModel):
    currentPassword: str
    newPassword: str
    confirmPassword: str
