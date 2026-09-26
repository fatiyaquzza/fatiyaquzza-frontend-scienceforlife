import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { readStore, readJsonStore, writeStore, removeStore } from '../utils/safeStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readStore('token');
    const parsedUser = readJsonStore('user');

    // Cache user yang hilang atau rusak tidak berarti sesi habis, selama tokennya
    // masih ada. Versi lama langsung menghapus token di kasus ini, jadi siapa pun
    // yang riwayat browser-nya terhapus atau tersisa setengah tulis harus login
    // ulang padahal tokennya masih valid. Sekarang user dipulihkan dari
    // /auth/me, dan token baru dibuang kalau memang sudah tidak berlaku.
    if (!token) {
      removeStore('user');
      setLoading(false);
      return;
    }

    if (parsedUser) setUser(parsedUser);
    api.get('/auth/me')
      .then((res) => {
        const fresh = res.data?.user;
        if (!fresh) return;
        setUser(fresh);
        writeStore('user', JSON.stringify(fresh));
      })
      .catch(() => {
        removeStore('token');
        removeStore('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      writeStore('token', token);
      writeStore('user', JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (name, email, password, job, address) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, job, address });
      const { token, user } = res.data;
      writeStore('token', token);
      writeStore('user', JSON.stringify(user));
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    removeStore('token');
    removeStore('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
