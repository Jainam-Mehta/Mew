import { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  Building2, ShieldCheck, Thermometer, Bell, 
  Save, Check, AlertCircle, Key, Lock, Phone,
  Mail, MessageCircle, Sliders, Radio, Clock, Calendar,
  CheckCircle2, Box, Cpu, Zap, Activity, BatteryCharging,
  Wifi, Gauge
} from 'lucide-react';

const AdminSettings = () => {
  const [activeCategory, setActiveCategory] = useState('iot');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Real-life Settings State covering all 3 services
  const [settings, setSettings] = useState({
    general: {
      platformName: 'Mew',
      tagline: 'Multi-Service Management Platform',
      companyName: 'Mew Telematics & Cold Chain Solutions',
      supportPhone: '+91 90904 80044',
      supportWhatsApp: '+91 91961 94288',
      supportEmail: 'sales@company.com',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD-MMM-YYYY HH:mm',
      allowSelfRegistration: true,
      defaultServiceId: 1
    },
    security: {
      sessionTimeoutMinutes: 1440,
      requireMFA: false,
      maxLoginAttempts: 5,
      requireStrongPasswords: true
    },
    iot: {
      // Global Ingestion
      temperatureUnit: 'C',
      telemetryPollingIntervalSeconds: 15,
      // Service 1: Sheela
      minTempThreshold: 2.0,
      maxTempThreshold: 8.0,
      humidityThreshold: 85.0,
      alertGracePeriodMinutes: 5,
      // Service 2: Mohan
      maxEquipmentTempThreshold: 75.0,
      vibrationLimitMms: 4.5,
      currentDrawLimitAmps: 32.0,
      maintenanceIntervalHours: 500,
      uptimeSlaPercent: 99.0,
      // Service 3: Godbaldeshlalputin
      sensorOfflineThresholdMinutes: 15,
      monthlyDataCapGb: 2.0,
      lowBatteryThresholdVolts: 3.3,
      maxPacketLossPercent: 5.0,
      autoOtaUpdates: false
    },
    notifications: {
      emailAlertsEnabled: true,
      smsAlertsEnabled: true,
      emergencyContactName: 'Facility On-Call Manager',
      alertEmailRecipient: 'alerts@company.com',
      alertPhoneRecipient: '+91 90904 80044',
      webhookUrl: 'https://hooks.slack.com/services/EXAMPLE/WEBHOOK'
    }
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Test Alert State
  const [testAlertState, setTestAlertState] = useState({ loading: false, message: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/settings');
      if (data) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          iot: {
            ...prev.iot,
            ...(data.iot || {})
          }
        }));
      }
    } catch (err) {
      console.warn('Using local settings baseline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const updated = await api.put('/admin/settings', settings);
      if (updated) {
        setSettings(updated);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.put('/admin/settings/password', passwordData);
      setPasswordMessage({ type: 'success', text: res.message || 'Admin password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSendTestAlert = async () => {
    setTestAlertState({ loading: true, message: '', type: '' });
    try {
      const res = await api.post('/admin/settings/test-alert');
      setTestAlertState({ loading: false, message: res.message || 'Alert dispatched successfully!', type: 'success' });
      setTimeout(() => setTestAlertState({ loading: false, message: '', type: '' }), 4500);
    } catch (err) {
      setTestAlertState({ loading: false, message: err.message || 'Failed to send alert', type: 'error' });
    }
  };

  const categories = [
    { id: 'iot', label: 'All Services Parameters', icon: Sliders, desc: 'Rules for Sheela, Mohan & Godbaldeshlalputin' },
    { id: 'general', label: 'Company & Localization', icon: Building2, desc: 'Organization profile, contacts & timezone' },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck, desc: 'Admin credentials & authentication policy' },
    { id: 'notifications', label: 'Alerting & Webhooks', icon: Bell, desc: 'Incident dispatch & webhook integrations' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Platform Settings</h2>
          <p className="text-sm text-gray-500">
            Configure enterprise operations, safety thresholds, emergency contacts, and multi-service rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 animate-fade-in">
              <Check className="w-4 h-4 text-green-600" /> Changes Saved
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Layout (Sidebar + Content) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-navy-700 to-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-primary-50 text-primary-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {cat.label}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-navy-100' : 'text-gray-500'} line-clamp-1`}>
                    {cat.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* ========================================================= */}
          {/* 1. All Services & IoT Rules (Sheela, Mohan, Godbaldeshlalputin) */}
          {/* ========================================================= */}
          {activeCategory === 'iot' && (
            <div className="space-y-6">
              {/* Global Telemetry Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary-600" /> Global Ingestion & Sampling Parameters
                  </h3>
                  <p className="text-xs text-gray-500">
                    Platform-wide units and telemetry polling frequency applied across all services.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Temperature Unit Preference</label>
                    <p className="text-xs text-gray-500 mb-3">Global unit used across telemetry tables and alarm notifications.</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleSettingChange('iot', 'temperatureUnit', 'C')}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm border transition-all ${
                          settings.iot.temperatureUnit === 'C'
                            ? 'bg-blue-600 text-white border-blue-600 shadow'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        Celsius (°C)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSettingChange('iot', 'temperatureUnit', 'F')}
                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm border transition-all ${
                          settings.iot.temperatureUnit === 'F'
                            ? 'bg-blue-600 text-white border-blue-600 shadow'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        Fahrenheit (°F)
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Telemetry Sampling Frequency</label>
                    <p className="text-xs text-gray-500 mb-3">Ingestion rate between sensor telemetry broadcasts.</p>
                    <select
                      value={settings.iot.telemetryPollingIntervalSeconds}
                      onChange={(e) => handleSettingChange('iot', 'telemetryPollingIntervalSeconds', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none"
                    >
                      <option value={5}>5 Seconds (High Precision)</option>
                      <option value={15}>15 Seconds (Standard Recommended)</option>
                      <option value={30}>30 Seconds</option>
                      <option value={60}>60 Seconds (Low Bandwidth)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Service 1: Sheela (Cold Storage) */}
              <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Thermometer className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">Service 1: Sheela (Cold Storage Monitoring)</h4>
                      <p className="text-xs text-gray-500">Smart agriculture, pharmaceutical cold chain, and food safety thresholds.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <label className="block text-xs font-semibold text-blue-900 mb-1">Min Safe Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.iot.minTempThreshold}
                      onChange={(e) => handleSettingChange('iot', 'minTempThreshold', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold text-blue-800 outline-none"
                    />
                    <span className="text-[10px] text-blue-600 mt-1 block">Under-cooling freeze alert</span>
                  </div>

                  <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100">
                    <label className="block text-xs font-semibold text-red-900 mb-1">Max Safe Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.iot.maxTempThreshold}
                      onChange={(e) => handleSettingChange('iot', 'maxTempThreshold', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-red-200 rounded-lg text-sm font-bold text-red-800 outline-none"
                    />
                    <span className="text-[10px] text-red-600 mt-1 block">Refrigeration breach alarm</span>
                  </div>

                  <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-100">
                    <label className="block text-xs font-semibold text-teal-900 mb-1">Max Relative Humidity (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={settings.iot.humidityThreshold}
                      onChange={(e) => handleSettingChange('iot', 'humidityThreshold', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-sm font-bold text-teal-800 outline-none"
                    />
                    <span className="text-[10px] text-teal-600 mt-1 block">Condensation hazard limit</span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Door-Spike Grace Period</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={settings.iot.alertGracePeriodMinutes}
                        onChange={(e) => handleSettingChange('iot', 'alertGracePeriodMinutes', parseInt(e.target.value) || 5)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none"
                      />
                      <span className="text-xs text-gray-600">min</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Suppresses door-opening spikes</span>
                  </div>
                </div>
              </div>

              {/* Service 2: Mohan (Industrial Equipment Analytics) */}
              <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">Service 2: Mohan (Industrial Equipment Analytics)</h4>
                      <p className="text-xs text-gray-500">Machinery vibration analysis, thermal overload protection, and preventive maintenance.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                    Analytics
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 pt-1">
                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                    <label className="block text-xs font-semibold text-purple-900 mb-1">Max Equipment Temp</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="1"
                        value={settings.iot.maxEquipmentTempThreshold}
                        onChange={(e) => handleSettingChange('iot', 'maxEquipmentTempThreshold', parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-sm font-bold text-purple-800 outline-none"
                      />
                      <span className="text-xs text-purple-700 font-semibold">°C</span>
                    </div>
                    <span className="text-[10px] text-purple-600 mt-1 block">Overheat cutoff limit</span>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                    <label className="block text-xs font-semibold text-purple-900 mb-1">Peak Vibration Limit</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={settings.iot.vibrationLimitMms}
                        onChange={(e) => handleSettingChange('iot', 'vibrationLimitMms', parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-sm font-bold text-purple-800 outline-none"
                      />
                      <span className="text-[11px] text-purple-700 font-semibold">mm/s</span>
                    </div>
                    <span className="text-[10px] text-purple-600 mt-1 block">Bearing/shaft wear alarm</span>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                    <label className="block text-xs font-semibold text-purple-900 mb-1">Max Current Draw</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={settings.iot.currentDrawLimitAmps}
                        onChange={(e) => handleSettingChange('iot', 'currentDrawLimitAmps', parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-sm font-bold text-purple-800 outline-none"
                      />
                      <span className="text-xs text-purple-700 font-semibold">A</span>
                    </div>
                    <span className="text-[10px] text-purple-600 mt-1 block">Motor electrical overload</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Maintenance Cycle</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={50}
                        step={50}
                        value={settings.iot.maintenanceIntervalHours}
                        onChange={(e) => handleSettingChange('iot', 'maintenanceIntervalHours', parseInt(e.target.value) || 500)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none"
                      />
                      <span className="text-xs text-gray-600">Hrs</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Service overhaul interval</span>
                  </div>

                  <div className="p-3 bg-green-50/60 rounded-xl border border-green-100">
                    <label className="block text-xs font-semibold text-green-900 mb-1">Target Uptime SLA</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min={90}
                        max={100}
                        value={settings.iot.uptimeSlaPercent}
                        onChange={(e) => handleSettingChange('iot', 'uptimeSlaPercent', parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-green-200 rounded-lg text-sm font-bold text-green-800 outline-none"
                      />
                      <span className="text-xs text-green-700 font-semibold">%</span>
                    </div>
                    <span className="text-[10px] text-green-600 mt-1 block">Minimum availability SLA</span>
                  </div>
                </div>
              </div>

              {/* Service 3: Godbaldeshlalputin (IoT Device Management Platform) */}
              <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-green-100 text-green-700">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">Service 3: Godbaldeshlalputin (IoT Device Management Platform)</h4>
                      <p className="text-xs text-gray-500">Fleet management, cellular gateway connectivity, bandwidth usage, and remote updates.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                    Platform
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">Heartbeat Silence Timeout</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={settings.iot.sensorOfflineThresholdMinutes}
                        onChange={(e) => handleSettingChange('iot', 'sensorOfflineThresholdMinutes', parseInt(e.target.value) || 15)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none"
                      />
                      <span className="text-xs text-gray-600">min</span>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">Marks gateway offline</span>
                  </div>

                  <div className="p-3.5 bg-green-50/60 rounded-xl border border-green-100">
                    <label className="block text-xs font-semibold text-green-900 mb-1">Monthly Cellular Data Cap</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        min={0.5}
                        value={settings.iot.monthlyDataCapGb}
                        onChange={(e) => handleSettingChange('iot', 'monthlyDataCapGb', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg text-sm font-bold text-green-800 outline-none"
                      />
                      <span className="text-xs text-green-700 font-semibold">GB</span>
                    </div>
                    <span className="text-[10px] text-green-600 mt-1 block">Per-device SIM limit</span>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100">
                    <label className="block text-xs font-semibold text-amber-900 mb-1">Low Battery Voltage Cutoff</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min={2.0}
                        max={12.0}
                        value={settings.iot.lowBatteryThresholdVolts}
                        onChange={(e) => handleSettingChange('iot', 'lowBatteryThresholdVolts', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm font-bold text-amber-800 outline-none"
                      />
                      <span className="text-xs text-amber-700 font-semibold">V</span>
                    </div>
                    <span className="text-[10px] text-amber-600 mt-1 block">Backup battery alarm</span>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <label className="block text-xs font-semibold text-blue-900 mb-1">Max Packet Loss Rate</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.5"
                        min={1}
                        max={25}
                        value={settings.iot.maxPacketLossPercent}
                        onChange={(e) => handleSettingChange('iot', 'maxPacketLossPercent', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold text-blue-800 outline-none"
                      />
                      <span className="text-xs text-blue-700 font-semibold">%</span>
                    </div>
                    <span className="text-[10px] text-blue-600 mt-1 block">Network degradation trigger</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Automatic Over-The-Air (OTA) Firmware Updates</p>
                    <p className="text-xs text-gray-500">Automatically push verified security patches to edge devices during low-traffic windows.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.iot.autoOtaUpdates}
                      onChange={(e) => handleSettingChange('iot', 'autoOtaUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. Company & Localization */}
          {/* ========================================================= */}
          {activeCategory === 'general' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary-600" /> Organization Profile & Public Information
                </h3>
                <p className="text-xs text-gray-500">Details displayed on customer dashboards, report headers, and service access screens.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Platform / Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.platformName}
                    onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Registered Legal Entity / Company
                  </label>
                  <input
                    type="text"
                    value={settings.general.companyName}
                    onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Customer Support & Sales Inquiries</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary-600" /> Support Hotline
                    </label>
                    <input
                      type="text"
                      value={settings.general.supportPhone}
                      onChange={(e) => handleSettingChange('general', 'supportPhone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-green-600" /> WhatsApp Direct Desk
                    </label>
                    <input
                      type="text"
                      value={settings.general.supportWhatsApp}
                      onChange={(e) => handleSettingChange('general', 'supportWhatsApp', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-navy-600" /> Sales / Billing Email
                    </label>
                    <input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Facility Localization</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Facility Timezone
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                      <option value="UTC">UTC (Universal Time Coordinated +00:00)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date & Time Display Format
                    </label>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none"
                    >
                      <option value="DD-MMM-YYYY HH:mm">18-Aug-2026 11:41 (Standard)</option>
                      <option value="YYYY-MM-DD HH:mm">2026-08-18 11:41 (ISO)</option>
                      <option value="DD/MM/YYYY hh:mm A">18/08/2026 11:41 AM (12-Hour)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-bold text-gray-800">Registration & Onboarding Policy</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Allow Self-Service User Signups</p>
                    <p className="text-xs text-gray-500">If disabled, only administrators can provision new client accounts.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.general.allowSelfRegistration}
                      onChange={(e) => handleSettingChange('general', 'allowSelfRegistration', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Default Service for New Registrations</p>
                    <p className="text-xs text-gray-500">Service automatically granted upon new account activation.</p>
                  </div>
                  <select
                    value={settings.general.defaultServiceId}
                    onChange={(e) => handleSettingChange('general', 'defaultServiceId', parseInt(e.target.value))}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none"
                  >
                    <option value={1}>Sheela (Cold Storage Monitoring)</option>
                    <option value={2}>Mohan (Industrial Equipment Analytics)</option>
                    <option value={3}>Godbaldeshlalputin (IoT Device Platform)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. Security & Credentials */}
          {/* ========================================================= */}
          {activeCategory === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary-600" /> Change Administrator Password
                  </h3>
                  <p className="text-xs text-gray-500">Regularly update your master admin account password for enhanced security.</p>
                </div>

                {passwordMessage.text && (
                  <div className={`p-3 rounded-lg text-sm mb-4 border flex items-center gap-2 ${
                    passwordMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">New Password *</label>
                      <input
                        type="password"
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-secondary text-sm font-semibold flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {changingPassword ? 'Updating...' : 'Update Admin Password'}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-navy-600" /> Authentication & Session Policies
                  </h3>
                  <p className="text-xs text-gray-500">Enforce enterprise access governance across all portal logins.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Session Inactivity Timeout</label>
                    <p className="text-xs text-gray-500 mb-3">Duration before idle authenticated sessions are signed out.</p>
                    <select
                      value={settings.security.sessionTimeoutMinutes}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeoutMinutes', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={60}>1 Hour</option>
                      <option value={720}>12 Hours</option>
                      <option value={1440}>24 Hours (Recommended)</option>
                      <option value={10080}>7 Days</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Max Failed Attempts Before Lockout</label>
                    <p className="text-xs text-gray-500 mb-3">Throttles brute-force password guessing attempts.</p>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication (2FA) Enforcement</p>
                    <p className="text-xs text-gray-500">Mandate OTP verification via SMS/Email for administrator access.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.requireMFA}
                      onChange={(e) => handleSettingChange('security', 'requireMFA', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. Alerting & Webhooks */}
          {/* ========================================================= */}
          {activeCategory === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" /> Incident Escalation & Webhook Integration
                </h3>
                <p className="text-xs text-gray-500">Configure communication pipelines for dispatching multi-service emergencies to on-duty staff.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Email Incident Bulletins</p>
                      <p className="text-xs text-gray-500">Immediate email report whenever thresholds breach safety limits.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailAlertsEnabled}
                        onChange={(e) => handleSettingChange('notifications', 'emailAlertsEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">WhatsApp / SMS Escalation</p>
                      <p className="text-xs text-gray-500">Direct urgent SMS message to on-call floor supervisors.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsAlertsEnabled}
                        onChange={(e) => handleSettingChange('notifications', 'smsAlertsEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      On-Duty Floor Manager / Contact Title
                    </label>
                    <input
                      type="text"
                      value={settings.notifications.emergencyContactName}
                      onChange={(e) => handleSettingChange('notifications', 'emergencyContactName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Emergency Alert Hotline / Phone
                    </label>
                    <input
                      type="text"
                      value={settings.notifications.alertPhoneRecipient}
                      onChange={(e) => handleSettingChange('notifications', 'alertPhoneRecipient', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Incident Distribution Email List
                  </label>
                  <input
                    type="email"
                    value={settings.notifications.alertEmailRecipient}
                    onChange={(e) => handleSettingChange('notifications', 'alertEmailRecipient', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-orange-500" /> Incident Webhook (Slack / Teams / PagerDuty)
                  </label>
                  <input
                    type="url"
                    value={settings.notifications.webhookUrl}
                    onChange={(e) => handleSettingChange('notifications', 'webhookUrl', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-orange-400 font-mono"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">Payload will be posted as JSON containing sensor ID, breach temperature/vibration, and timestamp.</span>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Verify Escalation Pipeline</p>
                    <p className="text-xs text-gray-500">Simulate an incident alarm to verify webhooks, email delivery, and SMS routing.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    disabled={testAlertState.loading}
                    className="px-4 py-2 bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Radio className="w-4 h-4" />
                    {testAlertState.loading ? 'Dispatching...' : 'Dispatch Test Alert'}
                  </button>
                </div>

                {testAlertState.message && (
                  <div className={`p-3 rounded-lg text-xs font-medium border flex items-center gap-2 animate-fade-in ${
                    testAlertState.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{testAlertState.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
