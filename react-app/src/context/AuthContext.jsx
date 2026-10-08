/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartsplit_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.me();
        setUser(response.data.data.user);
      } catch {
        localStorage.removeItem('smartsplit_token');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [token]);

  const login = async (payload) => {
    const response = await authService.login(payload);
    const session = response.data.data;
    localStorage.setItem('smartsplit_token', session.token);
    setToken(session.token);
    setUser(session.user);
    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    const session = response.data.data;
    localStorage.setItem('smartsplit_token', session.token);
    setToken(session.token);
    setUser(session.user);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // intentionally ignored for demo mode
    } finally {
      localStorage.removeItem('smartsplit_token');
      setToken('');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
