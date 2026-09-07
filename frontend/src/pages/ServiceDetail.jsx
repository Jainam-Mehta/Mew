import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/client';
import { 
  ArrowLeft, Thermometer, Droplets, Wifi, WifiOff, 
  AlertTriangle, Activity, TrendingUp, Calendar, RefreshCw,
  Sliders, ShieldCheck, CheckCircle2, Sun, Moon
} from 'lucide-react';
import SubscriptionRequired from '../components/SubscriptionRequired';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const { settings, formatTemp, tempUnit, checkSensorAlarm } = useSettings();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Technical service names mapping
  const serviceNames = {
    '1': 'IoT Environmental Telemetry Engine',
    '2': 'Industrial Machinery Diagnostics',
    '3': 'Edge Gateway & Device Orchestrator'
  };

  const serviceName = serviceNames[serviceId] || `Service ${serviceId}`;
  const [hasAccess, setHasAccess] = useState(
    user?.role === 'admin' || user?.subscribedServices?.includes(parseInt(serviceId))
  );

  const [loading, setLoading] = useState(true);
  const [filterSearch, setFilterSearch] = useState('');
  const [telemetry, setTelemetry] = useState({
    totalLocation: 1,
    totalSensor: 6,
    sensorOnline: 5,
    sensorOffline: 1,
    sensors: [
      { id: 1, location: 'Server Room Section 1', name: 'Temp', temperature: 28.1, humidity: 63.6, status: 'offline', lastSeen: '18-Aug-26 11:41' },
      { id: 2, location: 'Cold Storage Room A', name: 'Storage Sensor A1', temperature: 3.8, humidity: 87.2, status: 'online', lastSeen: 'Just now' },
      { id: 3, location: 'Cold Storage Room B', name: 'Deep Freeze B1', temperature: -18.2, humidity: 91.5, status: 'online', lastSeen: '1 min ago' },
      { id: 4, location: 'Cold Storage Room C', name: 'Ambient Sensor C1', temperature: 4.1, humidity: 86.0, status: 'online', lastSeen: 'Just now' },
      { id: 5, location: 'Dispatch Dock North', name: 'Dock Monitor D1', temperature: 12.4, humidity: 70.8, status: 'online', lastSeen: '2 mins ago' },
      { id: 6, location: 'Compressor Chamber 1', name: 'Chiller Thermal 01', temperature: 18.9, humidity: 55.3, status: 'online', lastSeen: 'Just now' },
    ]
  });

  const loadData = () => {
    setLoading(true);
    api.get(`/services/${serviceId}/data`)
      .then((data) => {
        if (data) {
          setHasAccess(data.is_accessible);
          if (data.sensors && data.sensors.length > 0) {
            setTelemetry({
              totalLocation: data.totalLocation,
              totalSensor: data.totalSensor,
              sensorOnline: data.sensorOnline,
              sensorOffline: data.sensorOffline,
              sensors: data.sensors
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Using fallback sensor data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Initial load and dynamic polling based on Admin Settings
  useEffect(() => {
    loadData();
    const intervalSec = settings?.iot?.telemetryPollingIntervalSeconds || 15;
    const intervalId = setInterval(() => {
      loadData();
    }, intervalSec * 1000);

    return () => clearInterval(intervalId);
  }, [serviceId, settings?.iot?.telemetryPollingIntervalSeconds]);

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleToggleSensor = async (sensorId) => {
    try {
      const res = await api.patch(`/services/${serviceId}/sensors/${sensorId}/toggle`);
      setTelemetry((prev) => ({
        ...prev,
        sensors: (prev.sensors || []).map((s) =>
          s.id === sensorId ? { ...s, is_enabled: res.is_enabled } : s
        )
      }));
    } catch (err) {
      console.error('Failed to toggle sensor:', err);
    }
  };

  if (!hasAccess) {
    return <SubscriptionRequired serviceName={serviceName} />;
  }

  const filteredSensors = telemetry.sensors.filter((s) =>
    s.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    s.location.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={user?.role === 'admin' ? 'Back to Admin' : 'Back to Dashboard'}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{serviceName}</h1>
                <p className="text-xs text-gray-500">
                  {settings?.platformName || 'Mew'} • Live Temperature & Humidity Monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh Readings"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>

              <span className="px-3 py-1 bg-green-100 dark:bg-green-950/70 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                Live Telemetry ({tempUnit})
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto">
            {['Temp/Humidity', 'Energy', 'DG', 'Transformer', 'Pump', 'UPS', 'Tank', 'HVAC', 'Vibration', 'Fire System', 'Netsafe', 'Agriculture', 'Steam/Boiler'].map((tab, idx) => (
              <button
                key={tab}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  idx === 0 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dynamic Operational Envelope Banner (Reflects Admin Settings) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                Operational Compliance Thresholds Active
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                  Admin Enforced
                </span>
              </h4>
              <p className="text-xs text-gray-600">
                Safe Temp: <strong className="text-blue-700 font-bold">{formatTemp(settings.iot.minTempThreshold)} to {formatTemp(settings.iot.maxTempThreshold)}</strong> • 
                Max Humidity: <strong className="text-teal-700 font-bold">{settings.iot.humidityThreshold}%</strong> • 
                Spike Grace: <strong className="text-gray-700 font-bold">{settings.iot.alertGracePeriodMinutes} mins</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <span>Unit: <strong className="text-gray-800">{tempUnit}</strong></span>
            <span>•</span>
            <span>Polling: <strong className="text-gray-800">{settings.iot.telemetryPollingIntervalSeconds}s</strong></span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Total Location</span>
            </div>
            <p className="text-4xl font-bold">{telemetry.totalLocation}</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Total Sensor</span>
            </div>
            <p className="text-4xl font-bold">{telemetry.totalSensor}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Sensor Online</span>
            </div>
            <p className="text-4xl font-bold">{telemetry.sensorOnline}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <WifiOff className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Sensor Offline</span>
            </div>
            <p className="text-4xl font-bold">{telemetry.sensorOffline}</p>
          </div>
        </div>

        {/* Temperature and Humidity Status Section */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-navy-600 to-primary-600 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Temperature and Humidity Telemetry</h2>
            <span className="text-xs text-navy-100 font-medium">
              Real-time feed ({settings.iot.telemetryPollingIntervalSeconds}s refresh)
            </span>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <button className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg">
                Tabular
              </button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Honeycomb
              </button>
              <div className="ml-auto">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Filter sensors..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* Data Table with dynamic units and alert checks */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Sensor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                      Temperature ({tempUnit})
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Humidity (%)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Compliance</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Sensor Switch</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSensors.map((sensor) => {
                    const alarmStatus = checkSensorAlarm(sensor.temperature, sensor.humidity);
                    const isEnabled = sensor.is_enabled !== false;

                    return (
                      <tr 
                        key={sensor.id} 
                        className={`border-b border-gray-100 transition-colors ${
                          !isEnabled 
                            ? 'bg-gray-100/70 opacity-60 hover:bg-gray-100' 
                            : sensor.status === 'offline' 
                            ? 'bg-red-50/60 hover:bg-red-100' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-4 text-sm text-gray-800 font-mono">#{sensor.id}</td>
                        <td className="px-4 py-4 text-sm text-gray-800">{sensor.location}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-800">{sensor.name}</td>
                        
                        {/* Dynamic Temperature Unit Formatted */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-bold text-gray-800">
                              {formatTemp(sensor.temperature)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-800">
                              {sensor.humidity !== null ? `${sensor.humidity}%` : 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Regulatory Compliance Pill */}
                        <td className="px-4 py-4">
                          {alarmStatus.alarm ? (
                            <span 
                              className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1"
                              title={alarmStatus.reason}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-700" />
                              Breach
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                              Safe
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            !isEnabled
                              ? 'bg-gray-200 text-gray-700'
                              : sensor.status === 'online' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {!isEnabled ? 'Disabled' : sensor.status}
                          </span>
                        </td>

                        {/* Sensor Enable / Disable Toggle Switch */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => handleToggleSensor(sensor.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isEnabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                            title={isEnabled ? 'Click to Disable Sensor' : 'Click to Enable Sensor'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`ml-2 text-xs font-semibold ${isEnabled ? 'text-green-700' : 'text-gray-500'}`}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs text-gray-600">{sensor.lastSeen || 'Just now'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
