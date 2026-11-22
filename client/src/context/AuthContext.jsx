import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('unimate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('unimate_token'));
  const [loading, setLoading] = useState(true);

  // Synchronize and verify authentication state on mount
  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem('unimate_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success && response.data.data.user) {
          const freshUser = response.data.data.user;
          setUser(freshUser);
          localStorage.setItem('unimate_user', JSON.stringify(freshUser));
        }
      } catch (err) {
        console.warn('[Auth] Token verification failed:', err.message);
        localStorage.removeItem('unimate_token');
        localStorage.removeItem('unimate_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { user: loggedInUser, token: authToken } = response.data.data;
      localStorage.setItem('unimate_token', authToken);
      localStorage.setItem('unimate_user', JSON.stringify(loggedInUser));
      setToken(authToken);
      setUser(loggedInUser);
      return loggedInUser;
    }
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      const { user: registeredUser, token: authToken } = response.data.data;
      localStorage.setItem('unimate_token', authToken);
      localStorage.setItem('unimate_user', JSON.stringify(registeredUser));
      setToken(authToken);
      setUser(registeredUser);
      return registeredUser;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.warn('[Auth] Remote logout notification failed:', err.message);
    } finally {
      localStorage.removeItem('unimate_token');
      localStorage.removeItem('unimate_user');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
