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
          setUser(profile);
          setIsAdmin(profile.role === 'admin');
          localStorage.setItem('user', JSON.stringify(profile));
          localStorage.setItem('isAdmin', String(profile.role === 'admin'));
        })
        .catch(() => {
          // If token expired or server offline, keep stored profile
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, name, mobile) => {
    try {
      const payload = { email, password };
      if (name) payload.name = name;
      if (mobile) payload.mobile = mobile;

      const data = await api.post('/auth/login', payload);

      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAdmin', String(data.isAdmin));

        setUser(data.user);
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

      if (email && password && name && mobile) {
        const regularUser = {
          email,
          name,
          mobile,
          role: 'user',
          subscribedServices: [1],
        };
        setUser(regularUser);
        setIsAdmin(false);
        localStorage.setItem('user', JSON.stringify(regularUser));
        localStorage.setItem('isAdmin', 'false');
        return { success: true, isAdmin: false };
      }

      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (name, email, mobile, password) => {
    try {
      const data = await api.post('/auth/register', { name, email, mobile, password });
      if (data && data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAdmin', String(data.isAdmin));
        setUser(data.user);
        setIsAdmin(data.isAdmin);
        return { success: true, isAdmin: false };
      }
    } catch (err) {
      return { success: false, message: err.message };
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
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
