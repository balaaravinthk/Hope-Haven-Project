import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Optional: Sync user profile if token is present on startup
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return;
      try {
        const res = await api.get('/auth/me');
        if (res.data?.data?.user) {
          setUser(res.data.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        }
      } catch (err) {
        // If token is expired or invalid, log out
        if (err.response?.status === 401) {
          logout();
        }
      }
    };

    fetchCurrentUser();
  }, [token]);

  /**
   * Log in user with credentials and optional role verification
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', credentials);
      const authData = response.data?.data;

      if (!authData || !authData.accessToken) {
        throw new Error('Authentication succeeded but no access token received.');
      }

      const receivedUser = authData.user;
      const receivedToken = authData.accessToken;

      // Persist in localStorage
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));

      // Update state
      setToken(receivedToken);
      setUser(receivedUser);

      return authData;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', userData);
      const authData = response.data?.data;

      if (authData?.accessToken && authData?.user) {
        localStorage.setItem('token', authData.accessToken);
        localStorage.setItem('user', JSON.stringify(authData.user));
        setToken(authData.accessToken);
        setUser(authData.user);
      }

      return authData;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out active user and purge storage
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
