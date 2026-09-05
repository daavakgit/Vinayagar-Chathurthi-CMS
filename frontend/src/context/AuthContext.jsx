import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdminApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('vcms_admin_token') ? true : false;
  });
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('vcms_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginAdminApi({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('vcms_admin_token', res.data.token);
        localStorage.setItem('vcms_admin_user', JSON.stringify(res.data.user));
        setIsAdmin(true);
        setAdminUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Authentication failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed. Please check credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem('vcms_admin_token');
    localStorage.removeItem('vcms_admin_user');
    setIsAdmin(false);
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, adminUser, loginAdmin, logoutAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
