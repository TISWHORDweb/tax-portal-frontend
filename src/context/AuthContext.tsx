import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { baseURL } from "../Utils/network.tsx";

interface User {
  id: string;
  nstin: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (nstin: string, password: string) => Promise<void>;
  enroll: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          setUser({
            id: decoded.id,
            nstin: decoded.nstin,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
          });
          setIsAuthenticated(true);
          
          // Set auth header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = async (nstin: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseURL}/auth/login`, { nstin, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const decoded = jwtDecode<any>(token);
      setUser({
        id: decoded.id,
        nstin: decoded.nstin,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      });
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const enroll = async (userData: any) => {
    try {
      setLoading(true);
      const response = await axios.post(`${baseURL}/auth/enroll`, userData);
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const decoded = jwtDecode<any>(token);
      setUser({
        id: decoded.id,
        nstin: decoded.nstin,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      });
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, enroll, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};