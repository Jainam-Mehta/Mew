import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { 
  ArrowLeft, Thermometer, Droplets, Wifi, WifiOff, 
  AlertTriangle, Activity, TrendingUp, Calendar, RefreshCw
} from 'lucide-react';
import SubscriptionRequired from '../components/SubscriptionRequired';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Service names mapping
  const serviceNames = {
    '1': 'Sheela',
    '2': 'Mohan',
    '3': 'Godbaldeshlalputin'
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

  useEffect(() => {
    loadData();
  }, [serviceId]);

  if (!hasAccess) {
    return <SubscriptionRequired serviceName={serviceName} />;
  }

  const filteredSensors = (telemetry.sensors || []).filter((s) => {
    if (!filterSearch) return true;
    const q = filterSearch.toLowerCase();
    return (
      s.location?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{serviceName}</h1>
                <p className="text-sm text-gray-600">Temperature & Humidity Live Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Readings"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active Telemetry
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          <div className="bg-gradient-to-r from-navy-600 to-primary-600 p-4">
            <h2 className="text-xl font-bold text-white">Temperature and Humidity Status</h2>
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sensor Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Temperature (°C)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Humidity (%)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSensors.map((sensor) => (
                    <tr 
                      key={sensor.id} 
                      className={`border-b border-gray-100 transition-colors ${
                        sensor.status === 'offline' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-4 text-sm text-gray-800">{sensor.id}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{sensor.location}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-800">{sensor.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-800">
                            {sensor.temperature !== null ? `${sensor.temperature}°C` : 'N/A'}
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
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          sensor.status === 'online' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {sensor.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{sensor.lastSeen || 'Just now'}</td>
                    </tr>
                  ))}
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
