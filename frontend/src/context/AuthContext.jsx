import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback demo users in case backend is offline
  const DEMO_USERS = {
    'user1@demo.com': {
      name: 'Rajesh Kumar',
      mobile: '+91 98765 43210',
      email: 'user1@demo.com',
      role: 'user',
      subscribedServices: [1],
    },
    'user2@demo.com': {
      name: 'Priya Sharma',
      mobile: '+91 87654 32109',
      email: 'user2@demo.com',
      role: 'user',
      subscribedServices: [1, 2],
    },
    'user3@demo.com': {
      name: 'Amit Patel',
      mobile: '+91 76543 21098',
      email: 'user3@demo.com',
      role: 'user',
      subscribedServices: [1, 2, 3],
    },
  };

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    const storedIsAdmin = localStorage.getItem('isAdmin');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAdmin(storedIsAdmin === 'true');
    }

    // Refresh profile from backend if token exists
    if (storedToken) {
      api.get('/auth/me')
        .then((profile) => {
          if (profile) {
            const normalizedUser = {
              ...profile,
              services: profile.subscribedServices || profile.services || (profile.role === 'admin' ? [1, 2, 3] : [1]),
              subscribedServices: profile.subscribedServices || profile.services || (profile.role === 'admin' ? [1, 2, 3] : [1])
            };
            setUser(normalizedUser);
            setIsAdmin(normalizedUser.role === 'admin');
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            localStorage.setItem('isAdmin', String(normalizedUser.role === 'admin'));
          }
        })
        .catch(() => {
          // If server offline, keep stored profile
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const payload = { email, password };
      const data = await api.post('/auth/login', payload);

      if (data && data.access_token) {
        const normalizedUser = {
          ...data.user,
          services: data.user?.subscribedServices || data.user?.services || (data.isAdmin ? [1, 2, 3] : [1]),
          subscribedServices: data.user?.subscribedServices || data.user?.services || (data.isAdmin ? [1, 2, 3] : [1])
        };

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('isAdmin', String(data.isAdmin));

        setUser(normalizedUser);
        setIsAdmin(data.isAdmin);

        return { success: true, isAdmin: data.isAdmin };
      }
    } catch (err) {
      // If backend responded with validation error, return it
      if (err.status && err.status !== 500 && err.status !== 502) {
        return { success: false, message: err.message };
      }

      // Fallback: Local offline demo mode
      console.warn('Backend unavailable, using local demo fallback');
      if (email === 'admin@company.com' && password === 'admin123') {
        const adminUser = { email, name: 'Admin', role: 'admin', subscribedServices: [1, 2, 3] };
        setUser(adminUser);
        setIsAdmin(true);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('isAdmin', 'true');
        return { success: true, isAdmin: true };
      }

      if (DEMO_USERS[email]) {
        const demoUser = DEMO_USERS[email];
        setUser(demoUser);
        setIsAdmin(false);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('isAdmin', 'false');
        return { success: true, isAdmin: false };
      }

      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
