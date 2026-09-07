import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { 
  Thermometer, Droplets, Wifi, WifiOff, AlertTriangle, 
  Activity, TrendingUp, RefreshCw, Sliders, ShieldCheck, 
  CheckCircle2, Clock, Calendar, Download, Phone, 
  MessageCircle, Mail, ChevronRight, Zap, Radio, 
  Gauge, BatteryCharging, Wind, Vibrate, Flame, 
  ShieldAlert, Sprout, FlameKindling, Info, Plus, Save,
  Bell, BellRing, MapPin, Compass, HelpCircle, ClipboardList, Send, FileText
} from 'lucide-react';
import PortalNavbar, { CATEGORIES } from '../components/portal/PortalNavbar';
import PortalSidebar from '../components/portal/PortalSidebar';
import UserProfileModal from '../components/portal/UserProfileModal';
import LiveSensorMap from '../components/portal/LiveSensorMap';
import TelemetryChart from '../components/portal/TelemetryChart';
import SupportTicketsModal from '../components/portal/SupportTicketsModal';
import UserAlertingSettings from '../components/portal/UserAlertingSettings';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { settings, tempUnit, formatTemp } = useSettings();
  const navigate = useNavigate();

  // Navigation state
  const [activeCategory, setActiveCategory] = useState('temp');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubDomain, setActiveSubDomain] = useState('main');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [ticketModalInitialTab, setTicketModalInitialTab] = useState('raise');

  // Data states
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [telemetry, setTelemetry] = useState({
    source: 'live_mew',
    meter_id: 225,
    total_locations: 1,
    total_sensors: 1,
    online_sensors: 0,
    offline_sensors: 1,
    sensors: [
      {
        id: 225,
        location: 'Server Room Section 1',
        name: 'Temp',
        temperature: 22.5,
        humidity: 63.2,
        status: 'offline',
        lastSeen: '31-Aug-26 19:14',
        min_temp: 1.0,
        max_temp: 28.0,
        min_humidity: 1.0,
        max_humidity: 85.0,
      }
    ],
    last_synced: 'Live'
  });

  const [alarmsData, setAlarmsData] = useState({
    settings: {
      zone: 'Server Room Main Zone',
      gateway_location: '1 Accord Data Facility',
      frequency: 'Every 5 mins',
      min_temp: 1.0,
      max_temp: 28.0,
      min_humidity: 1.0,
      max_humidity: 85.0,
      email_alerts: true,
      whatsapp_alerts: true,
      alert_phone: '+91 90904 80044',
      alert_email: user?.email || 'admin@company.com'
    },
    alarms: [
      {
        id: 'ALM-1029',
        sensor: 'Temp (Server Room Section 1)',
        type: 'Offline Status',
        severity: 'high',
        time: '31-Aug-2026 19:14',
        status: 'Active',
        acknowledged_by: 'Pending',
        value: 'Gateway signal offline'
      },
      {
        id: 'ALM-1014',
        sensor: 'Temp (Server Room Section 1)',
        type: 'Temperature Warning',
        severity: 'warning',
        time: '28-Aug-2026 14:32',
        status: 'Resolved',
        acknowledged_by: 'Auto-resolved',
        value: '24.8 °C'
      }
    ]
  });

  const [reportsData, setReportsData] = useState([]);
  const [reportDays, setReportDays] = useState(7);
  const [analysisPeriod, setAnalysisPeriod] = useState('7d');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  // Contact support details
  const [contact, setContact] = useState({
    supportPhone: '+91 90904 80044',
    supportWhatsApp: '+91 91961 94288',
    supportEmail: 'sales@company.com',
    companyName: 'Mew Telematics & Cold Chain Solutions'
  });

  // Fetch telemetry
  const loadTelemetry = async () => {
    setLoading(true);
    try {
      const data = await api.get('/users/me/telemetry');
      if (data && data.sensors) {
        setTelemetry(data);
      }
    } catch (err) {
      console.warn('Using local telemetry cache:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile
  const loadProfile = async () => {
    try {
      const p = await api.get('/users/me/profile');
      if (p) setProfile(p);
    } catch (err) {
      console.warn('Using local profile fallback:', err);
    }
  };

  // Fetch alarms
  const loadAlarms = async () => {
    try {
      const data = await api.get('/users/me/alarms');
      if (data && data.settings) {
        setAlarmsData(data);
      }
    } catch (err) {
      console.warn('Using local alarms fallback:', err);
    }
  };

  // Fetch reports
  const loadReports = async (days = reportDays) => {
    try {
      const data = await api.get(`/users/me/reports?days=${days}`);
      if (data && data.records) {
        setReportsData(data.records);
      }
    } catch (err) {
      console.warn('Using local reports fallback:', err);
    }
  };

  useEffect(() => {
    loadTelemetry();
    loadProfile();
    loadAlarms();
    loadReports(reportDays);

    // Auto poll telemetry every 15 seconds
    const interval = setInterval(() => {
      loadTelemetry();
    }, (settings?.iot?.telemetryPollingIntervalSeconds || 15) * 1000);

    return () => clearInterval(interval);
  }, [settings?.iot?.telemetryPollingIntervalSeconds]);

  // Handle saving alarm thresholds
  const handleSaveAlarmSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/me/alarms', alarmsData.settings);
      setSaveSuccessMessage('Alarm thresholds updated successfully.');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } catch (err) {
      alert('Failed to update alarm thresholds: ' + (err.message || 'Unknown error'));
    }
  };

  // Acknowledge alarm
  const handleAcknowledgeAlarm = (alarmId) => {
    setAlarmsData((prev) => ({
      ...prev,
      alarms: prev.alarms.map((a) =>
        a.id === alarmId ? { ...a, status: 'Acknowledged', acknowledged_by: user?.name || 'Operator' } : a
      )
    }));
  };

  // Export report as CSV
  const handleExportCSV = () => {
    if (!reportsData.length) return;
    const headers = ['Date', 'Sensor', 'Location', 'Avg Temp (°C)', 'Min Temp (°C)', 'Max Temp (°C)', 'Avg Humidity (%)', 'Uptime (%)'];
    const rows = reportsData.map((r) => [
      r.date,
      r.sensor_name,
      r.location,
      r.avg_temp,
      r.min_temp,
      r.max_temp,
      r.avg_humidity,
      r.uptime_percent
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetry_report_${profile?.user_name || '1_Accord'}_${reportDays}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active category definition
  const currentCatObj = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];
  const primarySensor = telemetry.sensors && telemetry.sensors[0] ? telemetry.sensors[0] : null;

  // Active alarms count
  const activeAlarmsCount = alarmsData.alarms.filter((a) => a.status === 'Active').length;

  /* ======================================================================
     RENDER VIEWS
     ====================================================================== */

  // 1. DASHBOARD VIEW (Mew Temperature / Cold Storage Telemetry)
  const renderDashboardView = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Cloud Sync Status Banner */}
      <div className="bg-gradient-to-r from-navy-800 via-navy-700 to-primary-800 text-white rounded-2xl p-5 shadow-lg border border-navy-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-primary-300 border border-white/10 shrink-0">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Cold Chain & Temperature Monitoring</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Mew Live
              </span>
            </div>
            <p className="text-xs text-navy-200">
              Assigned Gateway: #{telemetry.meter_id} • Location: {primarySensor?.location || 'Server Room Section 1'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTelemetry}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium border border-white/10 transition-colors shadow-xs"
            title="Force refresh live telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium text-xs shadow-md transition-colors"
          >
            Detailed Analytics
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Locations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{telemetry.total_locations || 1}</p>
            <span className="text-[11px] text-gray-400">Section 1 Facility</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sensors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{telemetry.total_sensors || 1}</p>
            <span className="text-[11px] text-gray-400">Registered Probe</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Online Probes</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{telemetry.online_sensors || 0}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Ready</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wifi className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Offline Probes</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{telemetry.offline_sensors || 1}</p>
            <span className="text-[11px] text-red-500 font-medium">Pending ping</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <WifiOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Sensor Card - Server Room Section 1 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <h3 className="text-xl font-bold text-gray-900">
                {primarySensor?.name || 'Temp'}
              </h3>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Sensor ID #{primarySensor?.id || 225}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Facility Location: <span className="font-semibold text-gray-700">{primarySensor?.location || 'Server Room Section 1'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Status: {primarySensor?.status || 'Offline'}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Last Seen: {primarySensor?.lastSeen || '31-Aug-26 19:14'}
            </span>
          </div>
        </div>

        {/* Live Gauges Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Temperature Metric Block */}
          <div className="bg-gradient-to-br from-blue-50/70 to-blue-100/40 p-6 rounded-2xl border border-blue-100/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary-700 font-semibold text-sm">
                <Thermometer className="w-5 h-5 text-primary-600" />
                <span>Ambient Temperature</span>
              </div>
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Probe Active
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl font-extrabold text-navy-900 tracking-tight">
                {primarySensor?.temperature !== undefined ? primarySensor.temperature : 22.5}
              </span>
              <span className="text-2xl font-semibold text-gray-600">°{tempUnit}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200/50 flex items-center justify-between text-xs text-gray-600">
              <span>Threshold Range:</span>
              <span className="font-bold text-gray-800">
                {primarySensor?.min_temp || 1.0}°C - {primarySensor?.max_temp || 28.0}°C
              </span>
            </div>
          </div>

          {/* Humidity Metric Block */}
          <div className="bg-gradient-to-br from-teal-50/70 to-teal-100/40 p-6 rounded-2xl border border-teal-100/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
                <Droplets className="w-5 h-5 text-teal-600" />
                <span>Relative Humidity (RH)</span>
              </div>
              <span className="text-xs font-medium text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">
                Hygrometer
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-5xl font-extrabold text-navy-900 tracking-tight">
                {primarySensor?.humidity !== undefined ? primarySensor.humidity : 63.2}
              </span>
              <span className="text-2xl font-semibold text-gray-600">%</span>
            </div>

            <div className="mt-4 pt-4 border-t border-teal-200/50 flex items-center justify-between text-xs text-gray-600">
              <span>Threshold Range:</span>
              <span className="font-bold text-gray-800">
                {primarySensor?.min_humidity || 1.0}% - {primarySensor?.max_humidity || 85.0}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Footer */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 gap-3">
          <div className="text-xs text-gray-500">
            Source: <span className="font-semibold text-navy-700">Mew Cloud Telemetry Stream</span> • Synced {telemetry.last_synced}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('alarms')}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-gray-500" />
              Configure Thresholds
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className="px-3.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              View Telemetry Trend
            </button>
          </div>
        </div>
      </div>

      {/* Live Map Embedding - Mew live location */}
      <LiveSensorMap 
        sensor={primarySensor} 
        onConfigureAlerts={() => setActiveTab('alarms')} 
      />
    </div>
  );

  // 2. ANALYSIS VIEW (Highcharts Dual-Axis Spline Replication)
  const renderAnalysisView = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Telemetry Trend & Analysis</h3>
        <p className="text-xs text-gray-500">
          Mew telemetry spline graphs, diurnal temperature/humidity curves, and interval filters.
        </p>
      </div>

      <TelemetryChart
        currentTemp={primarySensor?.temperature || 22.5}
        currentHum={primarySensor?.humidity || 63.2}
        meterName={primarySensor?.name || 'Temp'}
        meterId={telemetry.meter_id}
        location={primarySensor?.location || 'Server Room Section 1'}
      />
    </div>
  );

  // 3. SET ALERTS VIEW (Mew alerting form structure)
  const renderSetAlertsView = () => {
    const applyPreset = (minT, maxT, minH, maxH) => {
      setAlarmsData((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          min_temp: minT,
          max_temp: maxT,
          min_humidity: minH,
          max_humidity: maxH,
        }
      }));
    };

    return (
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Set Alarm Limits & Notifications</h3>
            <p className="text-xs text-gray-500">
              Configure temperature, humidity, escalation channels and polling frequency for Server Room Section 1 (Meter #225).
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset(2.0, 8.0, 20.0, 75.0)}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-primary-700 text-xs font-semibold rounded-lg border border-blue-100 transition-colors"
            >
              Pharma (2-8°C)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(18.0, 27.0, 30.0, 60.0)}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100 transition-colors"
            >
              Server Room (18-27°C)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(-25.0, -15.0, 10.0, 85.0)}
              className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-lg border border-cyan-100 transition-colors"
            >
              Deep Freeze (-25°C)
            </button>
          </div>
        </div>

        {saveSuccessMessage && (
          <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            {saveSuccessMessage}
          </div>
        )}

        <form onSubmit={handleSaveAlarmSettings} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
          {/* Node and Zone Configuration - Mew */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary-600" />
              Sensor & Hardware Node Mapping
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Active Probe / Meter
                </label>
                <select
                  value={telemetry.meter_id}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 text-gray-700 font-semibold outline-none"
                >
                  <option value="225">Temp (#225) - Server Room Section 1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Facility Zone
                </label>
                <input
                  type="text"
                  value={alarmsData.settings.zone || 'Server Room Main Zone'}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, zone: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Gateway Location
                </label>
                <input
                  type="text"
                  value={alarmsData.settings.gateway_location || '1 Accord Data Facility'}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, gateway_location: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Temperature Thresholds */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-primary-600" />
              Temperature Alarm Limits (°C)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">
                    Minimum Threshold (Low Alarm)
                  </label>
                  <span className="font-mono text-xs font-bold text-blue-700">
                    {alarmsData.settings.min_temp} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="0.5"
                  value={alarmsData.settings.min_temp}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, min_temp: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full accent-primary-600 cursor-pointer"
                />
                <input
                  type="number"
                  step="0.1"
                  value={alarmsData.settings.min_temp}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, min_temp: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono font-semibold"
                />
              </div>

              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">
                    Maximum Threshold (High Alarm)
                  </label>
                  <span className="font-mono text-xs font-bold text-red-600">
                    {alarmsData.settings.max_temp} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="60"
                  step="0.5"
                  value={alarmsData.settings.max_temp}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, max_temp: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full accent-red-600 cursor-pointer"
                />
                <input
                  type="number"
                  step="0.1"
                  value={alarmsData.settings.max_temp}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, max_temp: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Humidity Thresholds */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-teal-600" />
              Relative Humidity Limits (%)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">
                    Min Humidity Threshold
                  </label>
                  <span className="font-mono text-xs font-bold text-teal-700">
                    {alarmsData.settings.min_humidity} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={alarmsData.settings.min_humidity}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, min_humidity: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <input
                  type="number"
                  step="0.5"
                  value={alarmsData.settings.min_humidity}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, min_humidity: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono font-semibold"
                />
              </div>

              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">
                    Max Humidity Threshold
                  </label>
                  <span className="font-mono text-xs font-bold text-teal-700">
                    {alarmsData.settings.max_humidity} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={alarmsData.settings.max_humidity}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, max_humidity: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <input
                  type="number"
                  step="0.5"
                  value={alarmsData.settings.max_humidity}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, max_humidity: parseFloat(e.target.value) || 0 }
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Dispatch Frequency & Escalation Channels */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Escalation Frequency & Notification Channels
            </h4>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Notification Repeat Frequency
              </label>
              <select
                value={alarmsData.settings.frequency || 'Every 5 mins'}
                onChange={(e) =>
                  setAlarmsData({
                    ...alarmsData,
                    settings: { ...alarmsData.settings, frequency: e.target.value }
                  })
                }
                className="w-full sm:w-72 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="Every 5 mins">Every 5 mins (Immediate Escalation)</option>
                <option value="Every 15 mins">Every 15 mins</option>
                <option value="Every 30 mins">Every 30 mins</option>
                <option value="Hourly">Hourly Digest</option>
              </select>
            </div>

            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alarmsData.settings.email_alerts}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, email_alerts: e.target.checked }
                    })
                  }
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Email Alerts</span>
                  <span className="text-[11px] text-gray-500">Send instant critical alerts to registered organization inbox</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alarmsData.settings.whatsapp_alerts}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, whatsapp_alerts: e.target.checked }
                    })
                  }
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">WhatsApp Emergency Messages</span>
                  <span className="text-[11px] text-gray-500">Send automated alert dispatch to facility manager phone</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={alarmsData.settings.alert_email || ''}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, alert_email: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Recipient WhatsApp / SMS Phone
                </label>
                <input
                  type="tel"
                  value={alarmsData.settings.alert_phone || ''}
                  onChange={(e) =>
                    setAlarmsData({
                      ...alarmsData,
                      settings: { ...alarmsData.settings, alert_phone: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-navy-700 to-primary-600 hover:from-navy-800 hover:to-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save & Apply Alarm Configuration
            </button>
          </div>
        </form>

        {/* User Alerting & Webhooks Integration Configuration Panel */}
        <UserAlertingSettings />
      </div>
    );
  };

  // 4. ALARMS LIST VIEW
  const renderAlarmsListView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Alarms Event Feed</h3>
          <p className="text-xs text-gray-500">
            Real-time critical events and status changes for configured cold storage probes.
          </p>
        </div>
        <button
          onClick={loadAlarms}
          className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Alarms
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="p-4">Alarm ID</th>
              <th className="p-4">Sensor & Location</th>
              <th className="p-4">Incident Type</th>
              <th className="p-4">Trigger Value</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alarmsData.alarms.map((alarm) => (
              <tr key={alarm.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="p-4 font-mono font-bold text-navy-800">{alarm.id}</td>
                <td className="p-4 font-semibold text-gray-800">{alarm.sensor}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      alarm.severity === 'high'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {alarm.type}
                  </span>
                </td>
                <td className="p-4 text-gray-600 font-medium">{alarm.value}</td>
                <td className="p-4 text-gray-500">{alarm.time}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      alarm.status === 'Active'
                        ? 'bg-red-50 text-red-600 font-bold animate-pulse'
                        : 'bg-green-50 text-green-700'
                    }`}
                  >
                    {alarm.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {alarm.status === 'Active' ? (
                    <button
                      onClick={() => handleAcknowledgeAlarm(alarm.id)}
                      className="px-3 py-1 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Acknowledge
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400">By {alarm.acknowledged_by}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 5. REPORTS VIEW
  const renderReportsView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Telemetry Daily Reports</h3>
          <p className="text-xs text-gray-500">
            Export official temperature compliance logs for audits and cold chain compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={reportDays}
            onChange={(e) => {
              const d = parseInt(e.target.value);
              setReportDays(d);
              loadReports(d);
            }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 shadow-2xs outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Log
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
            <tr>
              <th className="p-3.5">Log Date</th>
              <th className="p-3.5">Sensor Unit</th>
              <th className="p-3.5">Facility Location</th>
              <th className="p-3.5">Avg Temp</th>
              <th className="p-3.5">Min Temp</th>
              <th className="p-3.5">Max Temp</th>
              <th className="p-3.5">Avg Humidity</th>
              <th className="p-3.5 text-right">Uptime SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reportsData.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                <td className="p-3.5 font-medium text-navy-800">{row.date}</td>
                <td className="p-3.5 font-semibold text-gray-800">{row.sensor_name}</td>
                <td className="p-3.5 text-gray-600">{row.location}</td>
                <td className="p-3.5 font-bold text-blue-600">{row.avg_temp} °C</td>
                <td className="p-3.5 text-gray-600">{row.min_temp} °C</td>
                <td className="p-3.5 text-gray-600">{row.max_temp} °C</td>
                <td className="p-3.5 font-bold text-teal-600">{row.avg_humidity} %</td>
                <td className="p-3.5 text-right">
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md font-semibold text-[11px]">
                    {row.uptime_percent}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 6. SCHEDULE VIEW
  const renderScheduleView = () => (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Operational Schedules & Shifts</h3>
        <p className="text-xs text-gray-500">
          Continuous shift coverage and sensor active logging intervals.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-600" />
          Active Logging Shifts
        </h4>

        <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3">Shift Name</th>
                <th className="p-3">Operating Window</th>
                <th className="p-3">Target Probe</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50">
                <td className="p-3 font-semibold text-gray-800">24x7 Uninterrupted Cold Chain</td>
                <td className="p-3 font-mono text-gray-600">00:00:00 - 23:59:59</td>
                <td className="p-3 text-gray-700">Temp (#225)</td>
                <td className="p-3 text-right">
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-semibold text-[11px]">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Continuous Compliance Monitoring</span>
            Temperature threshold violations are logged and dispatched immediately regardless of shift boundaries.
          </div>
        </div>
      </div>
    </div>
  );

  // 7. HELP DESK & TICKETS VIEW (Mew Help Desk)
  const renderHelpView = () => (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Support Desk & Complaints Portal</h3>
          <p className="text-xs text-gray-500">
            Hardware diagnostics, probe calibrations, gateway support, and ticket tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTicketModalInitialTab('raise');
              setShowTicketsModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-navy-700 to-primary-600 hover:from-navy-800 hover:to-primary-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Ticket</span>
          </button>

          <button
            onClick={() => {
              setTicketModalInitialTab('track');
              setShowTicketsModal(true);
            }}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-primary-600" />
            <span>Track Tickets</span>
          </button>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary-600">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">Need Hardware or Gateway Support?</h4>
            <p className="text-xs text-gray-500">
              Submit an issue regarding <span className="font-semibold text-gray-700">Temp (#{telemetry.meter_id})</span> in Server Room Section 1. Our cold chain engineers respond within SLA.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setTicketModalInitialTab('raise');
            setShowTicketsModal(true);
          }}
          className="btn-primary shrink-0 text-xs py-2.5 px-5 flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Complaint</span>
        </button>
      </div>

      {/* Emergency Hotline Cards */}
      <div className="bg-gradient-to-br from-navy-700 to-navy-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <h4 className="text-lg font-bold">24/7 Rapid Emergency Response Desk</h4>
        <p className="text-xs text-navy-200 leading-relaxed">
          Our specialized IoT and cold chain engineering center is available around the clock for sensor diagnostics, battery replacements, and gateway provisioning.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href={`tel:${contact.supportPhone.replace(/[^0-9+]/g, '')}`}
            className="p-3.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 flex items-center gap-3 transition-colors"
          >
            <Phone className="w-5 h-5 text-primary-300" />
            <div>
              <span className="text-[10px] text-navy-300 uppercase block font-semibold">Hotline Desk</span>
              <span className="text-xs font-bold text-white">{contact.supportPhone}</span>
            </div>
          </a>

          <a
            href={`https://wa.me/${contact.supportWhatsApp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-green-500/20 hover:bg-green-500/30 rounded-xl border border-green-400/20 flex items-center gap-3 transition-colors text-green-300"
          >
            <MessageCircle className="w-5 h-5 text-green-400" />
            <div>
              <span className="text-[10px] text-green-300 uppercase block font-semibold">WhatsApp Operations Desk</span>
              <span className="text-xs font-bold text-white">{contact.supportWhatsApp}</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );

  // 8. OTHER DOMAIN PLACEHOLDER VIEWS (When user selects Energy, DG, Pump, etc.)
  const renderOtherDomainView = () => {
    const domainNames = {
      ems: { name: 'Energy Monitoring System (EMS)', icon: Zap, metric: 'Active Load: 142.6 kW', unit: 'kWh' },
      dg: { name: 'Diesel Generator Analytics (DG)', icon: Radio, metric: 'Runtime: 412.4 Hrs', unit: 'Fuel: 84%' },
      trans: { name: 'Transformer Health & Power', icon: Gauge, metric: 'Winding Temp: 58.2 °C', unit: 'Load: 68%' },
      pump: { name: 'Water & Fluid Pump Telemetry', icon: Activity, metric: 'Discharge: 4.8 Bar', unit: 'Flow: 120 LPM' },
      bms: { name: 'UPS & Battery Management System', icon: BatteryCharging, metric: 'Battery SOC: 98.4%', unit: '415V' },
      wms: { name: 'Water Tank & Reservoir Level', icon: Droplets, metric: 'Capacity: 84.5%', unit: '12,500 L' },
      hvc: { name: 'HVAC & Chiller Performance', icon: Wind, metric: 'Chiller Temp: 6.8 °C', unit: 'COP: 4.2' },
      vib: { name: 'Vibration & Mechanical Diagnostics', icon: Vibrate, metric: 'Peak Velocity: 2.1 mm/s', unit: 'ISO Normal' },
      fms: { name: 'Fire Suppression & Detection', icon: Flame, metric: 'Line Pressure: 7.2 Bar', unit: 'Armed' },
      nbs: { name: 'Netsafe Electrical Safety', icon: ShieldAlert, metric: 'Earth Leakage: 12 mA', unit: 'Safe' },
      agr: { name: 'Smart Agriculture & Soil Telematics', icon: Sprout, metric: 'Moisture: 42%', unit: 'pH: 6.5' },
      steam: { name: 'Steam & Boiler Monitoring', icon: FlameKindling, metric: 'Steam Pressure: 8.5 Bar', unit: '172 °C' },
    };

    const d = domainNames[activeCategory] || { name: currentCatObj.label, icon: Activity, metric: 'Connected', unit: 'Normal' };
    const Icon = d.icon;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 border border-primary-100">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{d.name}</h3>
              <p className="text-xs text-gray-500">
                Organization: <span className="font-semibold text-gray-700">{profile?.user_name || '1 Accord'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveCategory('temp')}
            className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-primary-700 font-semibold text-xs hover:bg-blue-100 transition-colors"
          >
            &larr; Return to Temp/Humidity
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Telemetry Metric</p>
            <p className="text-2xl font-bold text-gray-800 mt-2">{d.metric}</p>
            <span className="text-xs text-green-600 font-medium">Operational</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Secondary Index</p>
            <p className="text-2xl font-bold text-primary-600 mt-2">{d.unit}</p>
            <span className="text-xs text-gray-400">Gateway Status</span>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Integration</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">Active Feed</p>
            <span className="text-xs text-emerald-600 font-medium">1 Accord Enterprise</span>
          </div>
        </div>

        <div className="p-8 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-3">
          <p className="text-sm font-bold text-gray-700">Dedicated {currentCatObj.label} Monitoring Suite</p>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            This module is mapped to organization <span className="font-semibold">{profile?.user_name || '1 Accord'}</span>. Real-time telemetry is synced via Mew Telematics IoT Gateway.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <PortalNavbar
        activeCategory={activeCategory}
        onSelectCategory={(catId) => setActiveCategory(catId)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenAlarms={() => setActiveTab('alarms_list')}
        user={user}
        profile={profile}
        logout={logout}
        alarmCount={activeAlarmsCount}
        contactPhone={contact.supportPhone}
        platformName={settings?.platformName || 'Mew'}
        tagline={settings?.tagline || 'Cold Storage & IoT Telematics'}
      />

      {/* Main Layout: Left Sidebar + Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <PortalSidebar
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          activeSubDomain={activeSubDomain}
          onSelectSubDomain={(subId) => setActiveSubDomain(subId)}
          categoryLabel={currentCatObj.label}
          meterName={primarySensor?.name || 'Temp'}
          sensorLocation={primarySensor?.location || 'Server Room Section 1'}
          profile={profile}
        />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          {activeCategory === 'temp' ? (
            <>
              {activeTab === 'dashboard' && renderDashboardView()}
              {activeTab === 'analysis' && renderAnalysisView()}
              {activeTab === 'alarms' && renderSetAlertsView()}
              {activeTab === 'alarms_list' && renderAlarmsListView()}
              {activeTab === 'reports' && renderReportsView()}
              {activeTab === 'schedule' && renderScheduleView()}
              {activeTab === 'all_alerts' && renderAlarmsListView()}
              {activeTab === 'help' && renderHelpView()}
            </>
          ) : (
            renderOtherDomainView()
          )}
        </main>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        user={user}
      />

      {/* Support Tickets Modal */}
      <SupportTicketsModal
        isOpen={showTicketsModal}
        onClose={() => setShowTicketsModal(false)}
        meterId={telemetry.meter_id}
        meterName={primarySensor?.name || 'Temp'}
      />
    </div>
  );
};

export default UserDashboard;
