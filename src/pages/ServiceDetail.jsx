import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Thermometer, Droplets, Wifi, WifiOff, 
  AlertTriangle, Activity, TrendingUp, Calendar
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

  const hasAccess = user?.subscribedServices?.includes(parseInt(serviceId));

  if (!hasAccess) {
    return <SubscriptionRequired serviceName={serviceName} />;
  }

  // Mock data for Sheela (Cold Storage Monitoring)
  const sensorData = [
    { id: 1, location: 'Server Room Section 1', name: 'Temp', temperature: 28.1, humidity: 63.6, status: 'offline', lastSeen: '18-Aug-26 11:41' }
  ];

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
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{serviceName}</h1>
                <p className="text-sm text-gray-600">Temperature & Humidity Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                1 Accord
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {['Temp/Humidity', 'Energy', 'DG', 'Transformer', 'Pump', 'UPS', 'Tank', 'HVAC', 'Vibration', 'Fire System', 'Netsafe', 'Agriculture', 'Steam/Boiler'].map((tab, idx) => (
              <button
                key={tab}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
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
            <p className="text-4xl font-bold">1</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Total Sensor</span>
            </div>
            <p className="text-4xl font-bold">1</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Sensor Online</span>
            </div>
            <p className="text-4xl font-bold">0</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <WifiOff className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Sensor Offline</span>
            </div>
            <p className="text-4xl font-bold">1</p>
          </div>
        </div>

        {/* Temperature and Humidity Status Section */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-navy-600 to-primary-600 p-4">
            <h2 className="text-xl font-bold text-white">Temperature and Humidity Status</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <button className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg">
                Tabular
              </button>
              <button className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Honeycomb
              </button>
              <div className="ml-auto">
                <input
                  type="text"
                  placeholder="Search..."
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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorData.map((sensor) => (
                    <tr key={sensor.id} className="border-b border-gray-100 bg-red-50 hover:bg-red-100 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-800">{sensor.id}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{sensor.location}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{sensor.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-800">{sensor.temperature}</span>
                          <span className="text-xs text-red-600">↓</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-800">{sensor.humidity}</span>
                          <span className="text-xs text-blue-600">↓</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          Offline
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{sensor.lastSeen}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors">
                            Edit
                          </button>
                          <button className="px-4 py-2 bg-navy-600 text-white text-sm font-medium rounded hover:bg-navy-700 transition-colors">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Temperature Trend</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Chart visualization would go here</p>
                <p className="text-xs mt-1">Real-time temperature monitoring</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Maintenance Health</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">System health metrics would go here</p>
                <p className="text-xs mt-1">Predictive maintenance indicators</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetail;
