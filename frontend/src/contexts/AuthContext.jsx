import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const t = res.data.access_token;
    localStorage.setItem('token', t);
    setToken(t);
    const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${t}` } });
    setUser(me.data);
    return me.data;
  };

  const register = async (email, password) => {
    const res = await api.post('/auth/register', { email, password });
    const t = res.data.access_token;
    localStorage.setItem('token', t);
    setToken(t);
    const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${t}` } });
    setUser(me.data);
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
