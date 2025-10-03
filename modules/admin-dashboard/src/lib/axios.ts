import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

console.log('Admin Dashboard API URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request URL:', (config.baseURL || '') + (config.url || ''));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
