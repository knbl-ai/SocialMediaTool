import { createContext, useState, useContext, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only check auth for protected routes
    const publicRoutes = ['/', '/auth'];
    const currentPath = window.location.pathname;
    
    if (!publicRoutes.includes(currentPath)) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.checkAuth();
      setUser(response);
      setError(null);
    } catch (error) {
      setUser(null);
      console.error('Auth check error:', error);
      
      // Only redirect to auth for protected routes
      const publicRoutes = ['/', '/auth'];
      const currentPath = window.location.pathname;
      
      if (!publicRoutes.includes(currentPath) && (error.status === 401 || error.status === 403)) {
        window.location.href = '/auth';
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });
      setUser(response.user);
      setError(null);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    try {
      setLoading(true);
      const response = await api.request('post', '/auth/google', { credential });
      setUser(response.user);
      setError(null);
      return response;
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message 
        || error.message 
        || 'Google login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setError(null);
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      const message = error.message || 'Logout failed';
      setError(message);
    }
  };

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      const response = await api.register({ email, password, name });
      setUser(response.user);
      setError(null);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    googleLogin,
    register,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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

export default AuthContext;
