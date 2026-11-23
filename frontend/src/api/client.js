import axios from 'axios';

// Support both VITE_API_URL and VITE_BACKEND_URL, and sanitize trailing slashes or /api paths
const rawUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').trim();
let baseURL = '/api';

if (rawUrl) {
  const cleanUrl = rawUrl.replace(/\/+$/, '');
  baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('varayal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('varayal_token')) {
        localStorage.removeItem('varayal_token');
        localStorage.removeItem('varayal_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;

