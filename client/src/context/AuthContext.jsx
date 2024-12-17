import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyToken();
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/verify`, { withCredentials: true });
      setUser(response.data);
      setError(null);
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        console.error('Verification error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/auth/login`, 
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/auth/google`, 
        { credential },
        { withCredentials: true }
      );
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || 'Google login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      const message = error.response?.data?.message || 'Logout failed';
      setError(message);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    googleLogin,
    verifyToken
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
