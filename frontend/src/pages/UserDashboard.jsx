import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { 
  LogOut, User, Bell, Settings, Activity, 
  TrendingUp, Thermometer, Box, Cpu,
  ChevronRight, Clock, Phone, MessageCircle, Mail, X, Sparkles
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
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedServiceToUpgrade, setSelectedServiceToUpgrade] = useState(null);

  // Dynamic Contact Information from Admin Settings
  const [contact, setContact] = useState({
    supportPhone: '+91 90904 80044',
    supportWhatsApp: '+91 91961 94288',
    supportEmail: 'sales@company.com',
    companyName: 'Mew Telematics & Cold Chain Solutions'
  });

  useEffect(() => {
    // Load services from API if available
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
        console.warn('Using default services:', err);
      });

    // Fetch dynamic contact details configured by Admin
    api.get('/settings/contact')
      .then((data) => {
        if (data) {
          setContact((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => {
        console.warn('Using fallback contact details:', err);
      });
  }, []);

  // Strict check preserving original user service access
  const hasAccess = (serviceId) => {
    if (user?.role === 'admin') return true;
    if (user?.subscribedServices && Array.isArray(user.subscribedServices)) {
      return user.subscribedServices.includes(serviceId);
    }
    const svc = services.find((s) => s.id === serviceId);
    return svc ? (svc.is_accessible ?? svc.subscribed ?? false) : false;
  };

  const handleServiceClick = (service) => {
    if (hasAccess(service.id)) {
      navigate(`/service/${service.id}`);
    } else {
      navigate(`/subscription-required/${service.id}`);
    }
  };

  const cleanPhone = (contact.supportPhone || '').replace(/[^0-9+]/g, '');
  const cleanWhatsApp = (contact.supportWhatsApp || '').replace(/[^0-9]/g, '');

  const activeServicesCount = user?.subscribedServices?.length ?? services.filter((s) => hasAccess(s.id)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-navy-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <MewIcon className="w-10 h-10" />
              <div>
                <span className="text-xl font-bold tracking-tight">Mew</span>
                <span className="text-xs text-navy-200 block">Dashboard</span>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center font-bold text-white shadow">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold">{user?.name}</div>
                  <div className="text-xs text-navy-200 capitalize">{user?.role}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 hover:bg-navy-600 rounded-lg text-navy-200 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Select a service below to access its dedicated dashboard and monitoring tools.
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-primary-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Active Subscriptions</p>
              <h4 className="text-2xl font-bold text-gray-800">
                {activeServicesCount} of {services.length}
              </h4>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">System Status</p>
              <h4 className="text-2xl font-bold text-green-600">Operational</h4>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Direct Desk</p>
              <h4 className="text-sm font-bold text-gray-800 truncate" title={contact.supportPhone}>
                {contact.supportPhone}
              </h4>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            const isAccessible = hasAccess(service.id);

            return (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group border ${
                  isAccessible ? 'border-gray-200' : 'border-red-200 opacity-80'
                }`}
              >
                {/* Card Header with Gradient */}
                <div className={`h-3 bg-gradient-to-r ${service.color}`} />

                <div className="p-6">
                  {/* Icon & Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    {isAccessible ? (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                        Active
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200">
                        Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Stats or Subscription Lock Notice */}
                  {isAccessible ? (
                    <>
                      <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                        {service.stats && Object.entries(service.stats).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-600 capitalize font-medium">{key}:</span>
                            <span className="font-bold text-gray-800">{value}</span>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/service/${service.id}`);
                        }}
                        className="w-full btn-primary flex items-center justify-center gap-2 group-hover:shadow-lg text-sm"
                      >
                        View Dashboard
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                        <p className="text-xs text-red-700 font-medium">
                          Subscription required to access live telemetry.
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/subscription-required/${service.id}`);
                        }}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                      >
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

        {/* Help & Upgrade Section - Dynamic Contact Info */}
        <div className="mt-8 bg-gradient-to-r from-navy-700 via-navy-800 to-primary-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-primary-300 font-semibold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Dedicated Upgrade Support
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Need More Services or Additional Sensors?</h3>
              <p className="text-navy-100 text-sm">
                Our operations and engineering desk is available to provision new cold storage facilities, industrial units, and IoT telemetry gateways.
              </p>
            </div>

            {/* Dynamic Contact Action Pills */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-xs backdrop-blur-sm border border-white/10 transition-all"
              >
                <Phone className="w-4 h-4 text-primary-300" />
                <span>{contact.supportPhone}</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-xl font-medium text-xs backdrop-blur-sm border border-green-400/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span>WhatsApp Desk</span>
              </a>

              <button
                onClick={() => {
                  setSelectedServiceToUpgrade(null);
                  setShowContactModal(true);
                }}
                className="bg-white text-navy-800 hover:bg-gray-100 font-bold px-5 py-3 rounded-xl text-xs transition-colors shadow-md"
              >
                Contact Sales Team
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Upgrade / Contact Sales Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedServiceToUpgrade ? `Unlock ${selectedServiceToUpgrade.name}` : 'Contact Sales & Upgrades'}
                </h3>
                <p className="text-xs text-gray-500">
                  Direct support and provisioning from {contact.companyName || 'Mew'}.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Connect with our dedicated sales and support engineers to activate this service or add enterprise telemetry packages to your subscription.
            </p>

            <div className="space-y-3 mb-6">
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center justify-between p-3.5 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Support Hotline</div>
                    <div className="text-sm font-bold text-blue-700">{contact.supportPhone}</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-white px-2.5 py-1 rounded-md shadow-xs">Call</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-green-50 hover:bg-green-100 rounded-xl border border-green-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">WhatsApp Urgent Desk</div>
                    <div className="text-sm font-bold text-green-700">{contact.supportWhatsApp}</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-600 bg-white px-2.5 py-1 rounded-md shadow-xs">Chat</span>
              </a>

              <a
                href={`mailto:${contact.supportEmail}`}
                className="flex items-center justify-between p-3.5 bg-navy-50 hover:bg-navy-100 rounded-xl border border-navy-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-navy-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Sales / Invoicing Email</div>
                    <div className="text-sm font-bold text-navy-700">{contact.supportEmail}</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-navy-600 bg-white px-2.5 py-1 rounded-md shadow-xs">Mail</span>
              </a>
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
