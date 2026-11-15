import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

