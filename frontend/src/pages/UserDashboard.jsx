import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { 
  LogOut, User, Bell, Settings, Activity, 
  TrendingUp, Thermometer, Box, Cpu,
  ChevronRight, Clock
} from 'lucide-react';
import MewIcon from '../components/MewIcon';

const ICON_MAP = {
  Thermometer: Thermometer,
  Box: Box,
  Cpu: Cpu,
};

const DEFAULT_SERVICES = [
  {
    id: 1,
    name: 'Sheela',
    description: 'Smart Agriculture Cold Storage Monitoring',
    icon: Thermometer,
    color: 'from-blue-500 to-blue-600',
    stats: { locations: 1, sensors: 14, online: 13 }
  },
  {
    id: 2,
    name: 'Mohan',
    description: 'Industrial Equipment Analytics',
    icon: Box,
    color: 'from-purple-500 to-purple-600',
    stats: { devices: 8, uptime: '99.2%', alerts: 2 }
  },
  {
    id: 3,
    name: 'Godbaldeshlalputin',
    description: 'IoT Device Management Platform',
    icon: Cpu,
    color: 'from-green-500 to-green-600',
    stats: { devices: 24, connected: 22, data: '1.2GB' }
  },
];

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState(DEFAULT_SERVICES);

  useEffect(() => {
    api.get('/services')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((s) => ({
            ...s,
            icon: ICON_MAP[s.icon] || Thermometer,
          }));
          setServices(mapped);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch services from API, using default data:', err);
      });
  }, [user]);

  const hasAccess = (service) => {
    if (typeof service.is_accessible === 'boolean') {
      return service.is_accessible;
    }
    return user?.subscribedServices?.includes(service.id);
  };

  const handleServiceClick = (service) => {
    if (hasAccess(service)) {
      navigate(`/service/${service.id}`);
    } else {
      navigate(`/subscription-required/${service.id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                <MewIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Mew</h1>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-navy-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your subscribed services and their current status.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-500" />
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">Active</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{user?.subscribedServices?.length || 0}</p>
            <p className="text-sm text-gray-600">Active Services</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">98.5%</p>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="text-sm text-gray-600">Active Alerts</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">24/7</p>
            <p className="text-sm text-gray-600">Monitoring</p>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Your Services</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = service.icon;
            const isAccessible = hasAccess(service);

            return (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group ${
                  !isAccessible ? 'opacity-75' : ''
                }`}
              >
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-br ${service.color} p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <IconComponent className="w-12 h-12 text-white mb-2" />
                  {!isAccessible && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Locked
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{service.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                  {isAccessible ? (
                    <>
                      <div className="space-y-2 mb-4">
                        {Object.entries(service.stats).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key}:</span>
                            <span className="font-semibold text-gray-800">{value}</span>
                          </div>
                        ))}
                      </div>
                      <button className="w-full btn-primary flex items-center justify-center gap-2 group-hover:shadow-lg">
                        View Dashboard
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-700 font-medium">
                          Subscription Required
                        </p>
                      </div>
                      <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2">
                        Contact Sales
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-navy-600 to-primary-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Need More Services?</h3>
              <p className="text-navy-100 mb-4">
                Contact our team to upgrade your subscription and unlock additional services.
              </p>
              <button className="bg-white text-navy-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                Contact Sales Team
              </button>
            </div>
            <Settings className="w-16 h-16 text-navy-300" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
