import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('varayal_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('varayal_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('varayal_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('varayal_token', res.token);
      localStorage.setItem('varayal_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('varayal_token', res.token);
      localStorage.setItem('varayal_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('varayal_token');
    localStorage.removeItem('varayal_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('varayal_user', JSON.stringify(res.user));
      }
    } catch (e) {}
  };

  const setWalletBalance = (newBalance) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, walletBalance: newBalance };
      localStorage.setItem('varayal_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
        setWalletBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

