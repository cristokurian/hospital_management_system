import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Listen to global logout event from Axios interceptors
    const handleLogoutEvent = () => {
      setUser(null);
    };
    
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials or connection error';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', registerData);
      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      }
      return { success: false, error: response.data.message || 'Registration failed' };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed due to connection error';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = (updatedFields) => {
    if (user) {
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
