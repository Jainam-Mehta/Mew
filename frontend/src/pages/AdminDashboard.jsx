import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  LogOut, Users, DollarSign, Settings,
  Plus, Edit, Trash2, CheckCircle, XCircle, Search,
  Activity, Shield, RefreshCw, Sliders,
  Sun, Moon, Thermometer, Box, Cpu
} from 'lucide-react';
import MewIcon from '../components/MewIcon';
import AdminSettings from '../components/admin/AdminSettings';
import AdminLiveUsersMap from '../components/admin/AdminLiveUsersMap';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState({
    stats: { totalUsers: 4, activeSubscriptions: 7, revenue: '$12,450', services: 3 },
    recentActivity: [],
    liveUsers: []
  });
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [subscriptionsMatrix, setSubscriptionsMatrix] = useState([]);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [subFeedback, setSubFeedback] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    status: 'active',
    subscription: 'monthly',
    services: [1]
  });

  const fetchOverview = async () => {
    try {
      const data = await api.get('/admin/overview');
      if (data && data.stats) {
        setOverview(data);
      }
    } catch (err) {
      console.warn('Failed to load admin overview:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const endpoint = searchQuery 
        ? `/admin/users?query=${encodeURIComponent(searchQuery)}`
        : '/admin/users';
      const data = await api.get(endpoint);
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.warn('Failed to load admin users:', err);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const data = await api.get('/admin/subscriptions');
      if (Array.isArray(data)) {
        setSubscriptionsData(data);
      }
    } catch (err) {
      console.warn('Failed to load subscriptions:', err);
    }
  };

  const fetchSubscriptionsMatrix = async () => {
    setLoadingMatrix(true);
    try {
      const data = await api.get('/admin/subscriptions/matrix');
      if (Array.isArray(data)) {
        setSubscriptionsMatrix(data);
      }
    } catch (err) {
      console.warn('Failed to load subscriptions matrix:', err);
    } finally {
      setLoadingMatrix(false);
    }
  };

  const handleToggleUserSubscription = async (userId, serviceId, currentIsActive) => {
    try {
      const res = await api.post('/admin/subscriptions/toggle', {
        user_id: userId,
        service_id: serviceId,
        is_active: !currentIsActive
      });
      setSubFeedback(res.message || 'Subscription entitlement updated successfully.');
      setTimeout(() => setSubFeedback(''), 3500);
      fetchSubscriptionsMatrix();
      fetchUsers();
      fetchOverview();
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    }
  };

  const handleUpdatePaymentStatus = async (userId, serviceId, newStatus) => {
    try {
      const res = await api.put('/admin/subscriptions/payment-status', {
        user_id: userId,
        service_id: serviceId,
        payment_status: newStatus
      });
      setSubFeedback(res.message || 'Payment status updated successfully.');
      setTimeout(() => setSubFeedback(''), 3500);
      fetchSubscriptionsMatrix();
      fetchUsers();
      fetchOverview();
      fetchSubscriptions();
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchSubscriptions();
    fetchSubscriptionsMatrix();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      status: 'active',
      subscription: 'monthly',
      services: [1]
    });
    setError('');
    setShowAddModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      mobile: u.mobile || '',
      password: '',
      status: u.status,
      subscription: u.subscription,
      services: [...(u.services || [])]
    });
    setError('');
    setShowAddModal(true);
  };

  const toggleServiceCheckbox = (serviceId) => {
    setFormData((prev) => {
      const current = prev.services || [];
      if (current.includes(serviceId)) {
        return { ...prev, services: current.filter((id) => id !== serviceId) };
      } else {
        return { ...prev, services: [...current, serviceId] };
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingUser) {
        // Update user
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          status: formData.status,
          subscription: formData.subscription,
          services: formData.services
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await api.put(`/admin/users/${editingUser.id}`, updatePayload);
      } else {
        // Create user
        await api.post('/admin/users', formData);
      }

      setShowAddModal(false);
      fetchUsers();
      fetchOverview();
      fetchSubscriptions();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.role === 'admin') {
      alert('Cannot delete administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user ${u.name}?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${u.id}`);
      fetchUsers();
      fetchOverview();
      fetchSubscriptions();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Live Map Showing All Users in Real-Time */}
      <AdminLiveUsersMap 
        liveUsers={overview.liveUsers || []} 
        onSelectUser={(u) => {
          setSearchQuery(u.email);
          setActiveTab('users');
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/70 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/60 px-2 py-1 rounded">+12%</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{overview.stats.totalUsers}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Total Users</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-950/70 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/60 px-2 py-1 rounded">+8%</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{overview.stats.activeSubscriptions}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Active Subscriptions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/70 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/60 px-2 py-1 rounded">+24%</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{overview.stats.revenue}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Monthly Revenue</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-800 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/70 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-slate-100">{overview.stats.services}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">Active Services</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-800 p-6 transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4">Recent Audit & Operational Activity</h3>
        <div className="space-y-4">
          {(overview.recentActivity || []).length > 0 ? (
            overview.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800">
                <div className={`w-2.5 h-2.5 rounded-full ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-slate-200">
                    <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold text-primary-600 dark:text-primary-400">{activity.service}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">User Management</h3>
          <p className="text-sm text-gray-600">Manage registered users and service subscriptions</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, or mobile..."
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-navy-600 to-primary-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Services</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Subscription</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-navy-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{u.name}</p>
                          {u.role === 'admin' && (
                            <span className="px-2 py-0.5 bg-navy-100 text-navy-800 text-xs rounded font-semibold flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.mobile || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {(u.services || []).map((serviceId) => {
                        const sNames = {
                          1: 'IoT Telemetry Engine',
                          2: 'Machinery Diagnostics',
                          3: 'Edge Orchestrator'
                        };
                        return (
                          <span key={serviceId} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs rounded-full font-medium">
                            {sNames[serviceId] || `Service ${serviceId}`}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">
                      {u.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(u)}
                        className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Subscription & Service Entitlements</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Activate and deactivate technical services for users, audit tenant subscriptions, and view revenue breakdown.
          </p>
        </div>
        <button
          onClick={fetchSubscriptionsMatrix}
          className="p-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loadingMatrix ? 'animate-spin' : ''}`} />
          Refresh Subscriptions
        </button>
      </div>

      {/* Real-time Feedback Banner */}
      {subFeedback && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{subFeedback}</span>
        </div>
      )}

      {/* Aggregate Service Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(subscriptionsData.length > 0 ? subscriptionsData : [
          { name: 'IoT Environmental Telemetry Engine', users: 4, revenue: '$8,450', plan: 'monthly/yearly' },
          { name: 'Industrial Machinery Diagnostics', users: 3, revenue: '$5,200', plan: 'yearly' },
          { name: 'Edge Gateway & Device Orchestrator', users: 2, revenue: '$3,100', plan: 'yearly' },
        ]).map((service, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-800 p-6 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-800 dark:text-slate-100">{service.name}</h4>
              <span className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                {idx === 0 ? <Thermometer className="w-5 h-5" /> : idx === 1 ? <Box className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-slate-400">Active Subscribed Tenants:</span>
                <span className="font-bold text-gray-800 dark:text-slate-100">{service.users}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-slate-400">Estimated MRR:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{service.revenue}</span>
              </div>
              <div className="flex justify-between text-xs items-center pt-1 border-t border-gray-100 dark:border-slate-800">
                <span className="text-gray-600 dark:text-slate-400">Default Plan:</span>
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 text-[11px] rounded-full font-semibold capitalize">
                  {service.plan}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Service Subscriptions Activation / Deactivation Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary-500" />
              User Service Entitlements Matrix
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Toggle specific services on or off for each registered user. Changes take effect instantly for the user's portal access.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {subscriptionsMatrix.length || users.length} Accounts Registered
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Billing Plan</th>
                <th className="py-3.5 px-4 text-center">Service 1: IoT Telemetry Engine</th>
                <th className="py-3.5 px-4 text-center">Service 2: Machinery Diagnostics</th>
                <th className="py-3.5 px-4 text-center">Service 3: Edge Gateway</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {(subscriptionsMatrix.length > 0 ? subscriptionsMatrix : users.map(u => ({
                user_id: u.id,
                user_name: u.name,
                email: u.email,
                role: u.role,
                status: u.status,
                subscriptions: [
                  { service_id: 1, service_name: 'IoT Environmental Telemetry Engine', is_active: (u.services || []).includes(1) || u.role === 'admin', plan: u.subscription || 'monthly', payment_status: 'pending' },
                  { service_id: 2, service_name: 'Industrial Machinery Diagnostics', is_active: (u.services || []).includes(2) || u.role === 'admin', plan: u.subscription || 'monthly', payment_status: 'pending' },
                  { service_id: 3, service_name: 'Edge Gateway & Device Orchestrator', is_active: (u.services || []).includes(3) || u.role === 'admin', plan: u.subscription || 'monthly', payment_status: 'pending' },
                ]
              }))).map((u) => {
                const sub1 = u.subscriptions?.find(s => s.service_id === 1) || { is_active: false };
                const sub2 = u.subscriptions?.find(s => s.service_id === 2) || { is_active: false };
                const sub3 = u.subscriptions?.find(s => s.service_id === 3) || { is_active: false };
                const isAdmin = u.role === 'admin';

                return (
                  <tr key={u.user_id} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                          isAdmin ? 'bg-indigo-600' : 'bg-primary-600'
                        }`}>
                          {u.user_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-slate-100">{u.user_name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAdmin
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                      }`}>
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-700 dark:text-slate-300 capitalize text-xs">
                        {sub1.plan || 'monthly'}
                      </span>
                    </td>

                    {/* Service 1 Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleUserSubscription(u.user_id, 1, sub1.is_active)}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            sub1.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-700'
                          }`}
                          title={`Click to ${sub1.is_active ? 'deactivate' : 'activate'} Service 1`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              sub1.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[11px] font-semibold ${sub1.is_active ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400'}`}>
                          {sub1.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>

                    {/* Service 2 Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleUserSubscription(u.user_id, 2, sub2.is_active)}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            sub2.is_active ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'
                          }`}
                          title={`Click to ${sub2.is_active ? 'deactivate' : 'activate'} Service 2`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              sub2.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[11px] font-semibold ${sub2.is_active ? 'text-purple-700 dark:text-purple-400' : 'text-gray-400'}`}>
                          {sub2.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>

                    {/* Service 3 Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleUserSubscription(u.user_id, 3, sub3.is_active)}
                          className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            sub3.is_active ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-slate-700'
                          }`}
                          title={`Click to ${sub3.is_active ? 'deactivate' : 'activate'} Service 3`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              sub3.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className={`text-[11px] font-semibold ${sub3.is_active ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400'}`}>
                          {sub3.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={sub1.payment_status || 'pending'}
                        onChange={(e) => handleUpdatePaymentStatus(u.user_id, 1, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-gray-300 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 font-semibold"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300'
                      }`}>
                        {u.status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-700 to-primary-600 border-b border-navy-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <MewIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{settings?.platformName || 'Mew'} Admin</h1>
                <p className="text-xs text-navy-200">{settings?.tagline || 'Full System Control'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Dark / Light Mode Switcher */}
              <button
                onClick={toggleTheme}
                id="admin-theme-toggle-btn"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-semibold border ${
                  isDark
                    ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 hover:bg-amber-400/25'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle dark/light mode"
              >
                {isDark
                  ? <><Sun className="w-4 h-4" /><span className="hidden sm:inline">Light</span></>
                  : <><Moon className="w-4 h-4" /><span className="hidden sm:inline">Dark</span></>}
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-navy-500">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-navy-200">Administrator</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-navy-700 font-bold">
                  A
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'subscriptions', label: 'Subscriptions', icon: DollarSign },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 font-bold'
                    : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'subscriptions' && renderSubscriptions()}
        {activeTab === 'settings' && <AdminSettings />}
      </main>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-none"
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Password (leave blank to keep unchanged)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-none"
                  placeholder="••••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={formData.subscription}
                    onChange={(e) => setFormData({ ...formData, subscription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Services
                </label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {[
                    { id: 1, name: 'IoT Environmental Telemetry Engine (Cold Storage)' },
                    { id: 2, name: 'Industrial Machinery Diagnostics' },
                    { id: 3, name: 'Edge Gateway & Device Orchestrator' }
                  ].map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={(formData.services || []).includes(s.id)}
                        onChange={() => toggleServiceCheckbox(s.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
