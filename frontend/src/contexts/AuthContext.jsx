import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { verifyToken } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const isValid = await verifyToken();

      if (isValid) {
        const response = await api.get('/users/profile');
        setUser(response.data.user);
        setIsLoggedIn(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const loginResponse = await api.post('/users/login', { email, password });
      
      if (!loginResponse.data.token) {
        throw new Error('No token received from server');
      }

      const token = `Bearer ${loginResponse.data.token}`;
      localStorage.setItem('jwtToken', token);
      
      api.defaults.headers.common['Authorization'] = token;

      try {
        const profileResponse = await api.get('/users/profile');
        setUser(profileResponse.data.user);
        setIsLoggedIn(true);
        return loginResponse;
      } catch (profileError) {
        console.error('Profile fetch error:', profileError);
        logout();
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      logout();
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      loading,
      login,
      logout,
      checkAuth 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 