import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://elimuconnect.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
