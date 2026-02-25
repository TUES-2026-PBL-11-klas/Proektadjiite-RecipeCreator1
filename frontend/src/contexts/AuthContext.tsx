import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, loginUser, registerUser, logoutUser, getAuthUser, getAuthToken } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedUser = getAuthUser();
    const savedToken = getAuthToken();
    
    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await registerUser(email, username, password);
      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
