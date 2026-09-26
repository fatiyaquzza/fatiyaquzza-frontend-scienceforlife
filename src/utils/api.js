import axios from 'axios';
import { readStore, removeStore } from './safeStorage';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? 'https://azure-barracuda-788858.hostingersite.com/api'
  : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = readStore('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Halaman yang menjadi tujuan dari redirect 401. Kalau tidak dikecualikan,
// kegagalan login itu sendiri membangkitkan 401, interceptor menangkapnya, lalu
// window.location.href='/login' memuat ulang halaman dan menghapus semua yang
// sudah diketik. Satu password salah = form kosong tanpa penjelasan.
const AUTH_PAGES = new Set(['/login', '/register']);

const isAuthPage = () => {
  if (typeof window === 'undefined') return false;
  return AUTH_PAGES.has(window.location.pathname);
};

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isAuthPage()) {
      removeStore('token');
      removeStore('user');
      window.location.href = '/login';
    }
    // Di halaman login, 401 dikembalikan saja ke pemanggil. Halaman itu yang
    // menampilkan "email atau password salah", jadi tidak ada token yang perlu
    // dibersihkan (memang tidak ada) dan tidak perlu redirect ke diri sendiri.
    return Promise.reject(error);
  }
);

export default api;
