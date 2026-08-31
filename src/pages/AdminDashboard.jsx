import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, DollarSign, Settings,
  Plus, Edit, Trash2, CheckCircle, XCircle, Search,
  Calendar, TrendingUp, Activity, AlertCircle
} from 'lucide-react';
import MewIcon from '../components/MewIcon';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddUser, setShowAddUser] = useState(false);

  // Mock data
  const [users, setUsers] = useState([
    { id: 1, name: 'Rajesh Kumar', email: 'user1@demo.com', mobile: '+91 98765 43210', services: [1], status: 'active', subscription: 'monthly' },
    { id: 2, name: 'Priya Sharma', email: 'user2@demo.com', mobile: '+91 87654 32109', services: [1, 2], status: 'active', subscription: 'yearly' },
    { id: 3, name: 'Amit Patel', email: 'user3@demo.com', mobile: '+91 76543 21098', services: [1, 2, 3], status: 'active', subscription: 'yearly' },
  ]);

  const stats = {
    totalUsers: users.length,
    activeSubscriptions: users.filter(u => u.status === 'active').length,
    revenue: '$12,450',
    services: 3,
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">+12%</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">+8%</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.activeSubscriptions}</p>
          <p className="text-sm text-gray-600">Active Subscriptions</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">+24%</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.revenue}</p>
          <p className="text-sm text-gray-600">Monthly Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.services}</p>
          <p className="text-sm text-gray-600">Active Services</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { user: 'Rajesh Kumar', action: 'subscribed to', service: 'Sheela', time: '2 hours ago', type: 'success' },
            { user: 'Priya Sharma', action: 'renewed subscription for', service: 'Mohan', time: '5 hours ago', type: 'success' },
            { user: 'Amit Patel', action: 'upgraded to access', service: 'Godbaldeshlalputin', time: '1 day ago', type: 'success' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.service}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
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
          <p className="text-sm text-gray-600">Manage users and their service subscriptions</p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-navy-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.mobile}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {user.services.map((serviceId) => (
                        <span key={serviceId} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                          S{serviceId}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">
                      {user.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
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
                      <button className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
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
  );

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800">Subscription Management</h3>
        <p className="text-sm text-gray-600">Manage billing and subscription plans</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Sheela', users: 3, revenue: '$8,450', plan: 'monthly/yearly' },
          { name: 'Mohan', users: 2, revenue: '$5,200', plan: 'yearly' },
          { name: 'Godbaldeshlalputin', users: 1, revenue: '$3,100', plan: 'yearly' },
        ].map((service, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-md p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">{service.name}</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users:</span>
                <span className="font-semibold text-gray-800">{service.users}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue:</span>
                <span className="font-semibold text-green-600">{service.revenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan Type:</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">
                  {service.plan}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-700 to-primary-600 border-b border-navy-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <MewIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mew Admin</h1>
                <p className="text-xs text-navy-200">Full System Control</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
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
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'subscriptions', label: 'Subscriptions', icon: DollarSign },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
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
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">System Settings</h3>
            <p className="text-gray-600">Configuration options will be available here</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
