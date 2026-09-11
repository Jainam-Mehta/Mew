import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import MewIcon from '../components/MewIcon';

const Login = () => {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (result && result.success) {
        navigate(result.isAdmin ? '/admin' : '/dashboard');
      } else {
        setError(result?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy-500 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl mb-4 shadow-2xl">
            <MewIcon className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{settings?.platformName || 'Mew'}</h1>
          <p className="text-navy-200">{settings?.tagline || 'Multi-Service Management Platform'}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 text-sm">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Admin and Demo Users hint */}
          <div className="mb-4 space-y-2">
            <div className="p-3 bg-navy-50 border border-navy-200 rounded-lg">
              <p className="text-xs font-semibold text-navy-800 mb-1">Admin Access:</p>
              <p className="text-xs text-navy-700">admin@company.com / admin123</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-800 mb-1">Demo Users (any password):</p>
              <div className="space-y-1">
                <p className="text-xs text-green-700">• user1@demo.com - Access: IoT Telemetry Engine only</p>
                <p className="text-xs text-green-700">• user2@demo.com - Access: IoT Telemetry + Machinery Diagnostics</p>
                <p className="text-xs text-green-700">• user3@demo.com - Access: All 3 Technical Services</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full btn-primary flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <LogIn className="w-5 h-5" />
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3 text-center">Quick Demo Login:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setEmail('user1@demo.com');
                  setPassword('demo');
                }}
                className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded hover:bg-blue-100 transition-colors"
              >
                User 1
              </button>
              <button
                onClick={() => {
                  setEmail('user2@demo.com');
                  setPassword('demo');
                }}
                className="px-3 py-2 bg-purple-50 text-purple-700 text-xs font-medium rounded hover:bg-purple-100 transition-colors"
              >
                User 2
              </button>
              <button
                onClick={() => {
                  setEmail('user3@demo.com');
                  setPassword('demo');
                }}
                className="px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded hover:bg-green-100 transition-colors"
              >
                User 3
              </button>
            </div>
          </div>

          {/* Contact Admin for Account Creation */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need an account? Contact your administrator to create one.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-navy-200 text-sm mt-6">
          © 2026 Mew Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
