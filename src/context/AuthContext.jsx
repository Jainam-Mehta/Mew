import { createContext, useContext, useState, useEffect } from 'react';

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

  // Admin credentials (hardcoded for now)
  const ADMIN_EMAIL = 'admin@company.com';
  const ADMIN_PASSWORD = 'admin123';

  // Demo users with predefined subscriptions
  const DEMO_USERS = {
    'user1@demo.com': {
      name: 'Rajesh Kumar',
      mobile: '+91 98765 43210',
      email: 'user1@demo.com',
      role: 'user',
      subscribedServices: [1], // Only Sheela
    },
    'user2@demo.com': {
      name: 'Priya Sharma',
      mobile: '+91 87654 32109',
      email: 'user2@demo.com',
      role: 'user',
      subscribedServices: [1, 2], // Sheela and Mohan
    },
    'user3@demo.com': {
      name: 'Amit Patel',
      mobile: '+91 76543 21098',
      email: 'user3@demo.com',
      role: 'user',
      subscribedServices: [1, 2, 3], // All services
    },
  };

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    const storedIsAdmin = localStorage.getItem('isAdmin');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAdmin(storedIsAdmin === 'true');
    }
  }, []);

  const login = (email, password, name, mobile) => {
    // Check if admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = {
        email,
        name: 'Admin',
        role: 'admin',
      };
      setUser(adminUser);
      setIsAdmin(true);
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('isAdmin', 'true');
      return { success: true, isAdmin: true };
    }

    // Check if demo user
    if (DEMO_USERS[email] && password) {
      const demoUser = DEMO_USERS[email];
      setUser(demoUser);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(demoUser));
      localStorage.setItem('isAdmin', 'false');
      return { success: true, isAdmin: false };
    }

    // Regular user login (accept any credentials for now)
    if (email && password && name && mobile) {
      const regularUser = {
        email,
        name,
        mobile,
        role: 'user',
        subscribedServices: [1], // Default: user has access to Sheela (Service 1) only
      };
      setUser(regularUser);
      setIsAdmin(false);
      localStorage.setItem('user', JSON.stringify(regularUser));
      localStorage.setItem('isAdmin', 'false');
      return { success: true, isAdmin: false };
    }

    return { success: false, message: 'Please fill all required fields' };
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
  };

  const value = {
    user,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
