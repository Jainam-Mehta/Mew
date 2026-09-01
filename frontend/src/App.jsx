import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
    </Router>
  );
}

// Wrapper to pass serviceId to SubscriptionRequired
const SubscriptionRequiredWrapper = () => {
  const { serviceId } = useParams();
  const serviceNames = {
    '1': 'Sheela',
    '2': 'Mohan',
    '3': 'Godbaldeshlalputin'
  };
  const serviceName = serviceNames[serviceId] || `Service ${serviceId}`;
  return <SubscriptionRequired serviceName={serviceName} />;
};

export default App;
