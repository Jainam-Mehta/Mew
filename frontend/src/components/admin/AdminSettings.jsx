import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { 
  Building2, ShieldCheck, Thermometer, Bell, 
  Save, Check, AlertCircle, Key, Lock, Phone,
  Mail, MessageCircle, Sliders, Radio, Clock, Calendar,
  CheckCircle2, Box, Cpu, Zap, Activity, BatteryCharging,
  Wifi, Gauge
} from 'lucide-react';

const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [activeCategory, setActiveCategory] = useState('general');
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
      // Service 1: IoT Environmental Telemetry Engine
      minTempThreshold: 2.0,
      maxTempThreshold: 8.0,
      humidityThreshold: 85.0,
      alertGracePeriodMinutes: 5,
      // Service 2: Industrial Machinery Diagnostics
      maxEquipmentTempThreshold: 75.0,
      vibrationLimitMms: 4.5,
      currentDrawLimitAmps: 32.0,
      maintenanceIntervalHours: 500,
      uptimeSlaPercent: 99.0,
      // Service 3: Edge Gateway & Device Orchestrator
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
      if (refreshSettings) {
        await refreshSettings();
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
    { id: 'general', label: 'Company & Localization', icon: Building2, desc: 'Organization profile, contacts & timezone' },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck, desc: 'Admin credentials & authentication policy' },
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
          {/* 1. Company & Localization */}
          {/* ========================================================= */}
          {activeCategory === 'general' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 space-y-6">
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
                    <option value={1}>IoT Environmental Telemetry Engine (Cold Storage)</option>
                    <option value={2}>Industrial Machinery Diagnostics</option>
                    <option value={3}>Edge Gateway & Device Orchestrator</option>
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
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
