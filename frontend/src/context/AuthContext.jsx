import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('elyndor_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('elyndor_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          localStorage.setItem('elyndor_user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Auth verification failed', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('elyndor_token', access_token);
      localStorage.setItem('elyndor_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Login failed. Please check connection.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      // Auto login after registration
      return await login(userData.email, userData.password);
    } catch (error) {
      console.error('REGISTRATION ERROR:', error);
      return {
        success: false,
        message: error.response?.data?.detail || 'Registration failed. Please check connection.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('elyndor_token');
    localStorage.removeItem('elyndor_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
