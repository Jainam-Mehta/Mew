import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetail from './pages/ServiceDetail';
import SubscriptionRequired from './components/SubscriptionRequired';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/service/:serviceId"
                element={
                  <ProtectedRoute>
                    <ServiceDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscription-required/:serviceId"
                element={
                  <ProtectedRoute>
                    <SubscriptionRequiredWrapper />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </Router>
  );
}

// Wrapper to pass serviceId to SubscriptionRequired
const SubscriptionRequiredWrapper = () => {
  const { serviceId } = useParams();
  const serviceNames = {
    '1': 'IoT Environmental Telemetry Engine',
    '2': 'Industrial Machinery Diagnostics',
    '3': 'Edge Gateway & Device Orchestrator'
  };
  const serviceName = serviceNames[serviceId] || `Service ${serviceId}`;
  return <SubscriptionRequired serviceName={serviceName} />;
};

export default App;
