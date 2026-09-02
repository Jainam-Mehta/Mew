import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

const DEFAULT_SETTINGS = {
  platformName: 'Mew',
  tagline: 'Multi-Service Management Platform',
  companyName: 'Mew Telematics & Cold Chain Solutions',
  supportPhone: '+91 90904 80044',
  supportWhatsApp: '+91 91961 94288',
  supportEmail: 'sales@company.com',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD-MMM-YYYY HH:mm',
  iot: {
    temperatureUnit: 'C',
    telemetryPollingIntervalSeconds: 15,
    minTempThreshold: 2.0,
    maxTempThreshold: 8.0,
    humidityThreshold: 85.0,
    alertGracePeriodMinutes: 5,
    maxEquipmentTempThreshold: 75.0,
    vibrationLimitMms: 4.5,
    currentDrawLimitAmps: 32.0,
    maintenanceIntervalHours: 500,
    uptimeSlaPercent: 99.0,
    sensorOfflineThresholdMinutes: 15,
    monthlyDataCapGb: 2.0,
    lowBatteryThresholdVolts: 3.3,
    maxPacketLossPercent: 5.0,
    autoOtaUpdates: false,
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await api.get('/settings/config');
      if (data && data.platformName) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          iot: {
            ...prev.iot,
            ...(data.iot || {})
          }
        }));

        // Dynamically update browser tab title
        if (data.platformName) {
          document.title = `${data.platformName} - ${data.tagline || 'Platform'}`;
        }
      }
    } catch (err) {
      console.warn('Using baseline settings configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Helper to format temperature according to temperatureUnit ('C' or 'F')
  const formatTemp = (celsiusValue) => {
    if (celsiusValue === undefined || celsiusValue === null || isNaN(celsiusValue)) {
      return '--';
    }
    const unit = settings.iot?.temperatureUnit || 'C';
    if (unit === 'F') {
      const fahrenheit = (celsiusValue * 9) / 5 + 32;
      return `${fahrenheit.toFixed(1)}°F`;
    }
    return `${celsiusValue.toFixed(1)}°C`;
  };

  // Helper to check if a sensor temperature or humidity breaches thresholds
  const checkSensorAlarm = (tempCelsius, humidity) => {
    const iot = settings.iot || {};
    const minT = iot.minTempThreshold ?? -20;
    const maxT = iot.maxTempThreshold ?? 30;
    const maxH = iot.humidityThreshold ?? 85;

    if (tempCelsius !== undefined && tempCelsius !== null) {
      if (tempCelsius < minT) return { alarm: true, reason: 'Under-cooling freeze breach' };
      if (tempCelsius > maxT) return { alarm: true, reason: 'Overheating breach' };
    }
    if (humidity !== undefined && humidity !== null) {
      if (humidity > maxH) return { alarm: true, reason: 'High humidity condensation hazard' };
    }
    return { alarm: false, reason: 'Normal' };
  };

  const value = {
    settings,
    loading,
    refreshSettings: fetchSettings,
    formatTemp,
    checkSensorAlarm,
    tempUnit: settings.iot?.temperatureUnit === 'F' ? '°F' : '°C',
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsContext;
