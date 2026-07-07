import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: null,
    email: null,
    role: null,
    authenticated: false,
  });
  const [loading, setLoading] = useState(true);

  const restoreSession = async () => {
    try {
      const data = await authApi.checkSession();
      if (data && data.role) {
        setUser({
          name: data.name,
          email: data.email,
          role: data.role,
          authenticated: true,
        });
      } else {
        setUser({ name: null, email: null, role: null, authenticated: false });
      }
    } catch (error) {
      // session expired or invalid
      setUser({ name: null, email: null, role: null, authenticated: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser({
      name: data.name,
      email: data.email,
      role: data.role,
      authenticated: true,
    });
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout API failed', e);
    }
    setUser({
      name: null,
      email: null,
      role: null,
      authenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
