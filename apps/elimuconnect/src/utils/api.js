import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (response?.status === 404) {
      toast.error('Resource not found.');
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (!navigator.onLine) {
      toast.error('No internet connection. Please check your network.');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verify: (verificationData) => api.post('/auth/verify', verificationData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getProgress: () => api.get('/users/progress'),
  updateSettings: (settings) => api.put('/users/settings', settings),
};

export const schoolAPI = {
  search: (query) => api.get(`/schools/search?q=${query}`),
  getById: (id) => api.get(`/schools/${id}`),
  verify: (schoolData) => api.post('/schools/verify', schoolData),
};

export const libraryAPI = {
  getBooks: (params) => api.get('/books', { params }),
  getBook: (id) => api.get(`/books/${id}`),
  searchBooks: (query, filters) => api.get(`/books/search?q=${query}`, { params: filters }),
  getBookmarks: () => api.get('/books/bookmarks'),
  addBookmark: (bookId) => api.post(`/books/${bookId}/bookmark`),
  removeBookmark: (bookId) => api.delete(`/books/${bookId}/bookmark`),
  getReadingProgress: (bookId) => api.get(`/books/${bookId}/progress`),
  updateReadingProgress: (bookId, progress) => api.put(`/books/${bookId}/progress`, progress),
  downloadBook: (bookId) => api.get(`/books/${bookId}/download`, { responseType: 'blob' }),
};

export const papersAPI = {
  getPastPapers: (params) => api.get('/papers', { params }),
  getPaper: (id) => api.get(`/papers/${id}`),
  searchPapers: (query, filters) => api.get(`/papers/search?q=${query}`, { params: filters }),
  downloadPaper: (id) => api.get(`/papers/${id}/download`, { responseType: 'blob' }),
  getRevisionMaterials: (subject) => api.get(`/papers/revision/${subject}`),
  submitQuizAnswer: (quizId, answers) => api.post(`/papers/quiz/${quizId}/submit`, { answers }),
  getQuizResults: (quizId) => api.get(`/papers/quiz/${quizId}/results`),
};

export const forumAPI = {
  getDiscussions: (params) => api.get('/forum/discussions', { params }),
  getDiscussion: (id) => api.get(`/forum/discussions/${id}`),
  createDiscussion: (discussionData) => api.post('/forum/discussions', discussionData),
  updateDiscussion: (id, data) => api.put(`/forum/discussions/${id}`, data),
  deleteDiscussion: (id) => api.delete(`/forum/discussions/${id}`),
  addReply: (discussionId, replyData) => api.post(`/forum/discussions/${discussionId}/replies`, replyData),
  voteDiscussion: (id, vote) => api.post(`/forum/discussions/${id}/vote`, { vote }),
  getCategories: () => api.get('/forum/categories'),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (id) => api.get(`/messages/conversations/${id}`),
  sendMessage: (conversationId, messageData) => api.post(`/messages/conversations/${conversationId}/messages`, messageData),
  createConversation: (recipientId) => api.post('/messages/conversations', { recipientId }),
  markAsRead: (conversationId) => api.put(`/messages/conversations/${conversationId}/read`),
  uploadFile: (file) => api.post('/messages/upload', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const groupAPI = {
  getGroups: (params) => api.get('/groups', { params }),
  getGroup: (id) => api.get(`/groups/${id}`),
  createGroup: (groupData) => api.post('/groups', groupData),
  joinGroup: (id) => api.post(`/groups/${id}/join`),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
  updateGroup: (id, data) => api.put(`/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  getGroupMembers: (id) => api.get(`/groups/${id}/members`),
  inviteToGroup: (id, userIds) => api.post(`/groups/${id}/invite`, { userIds }),
};

export const analyticsAPI = {
  getDashboardData: (role) => api.get(`/analytics/dashboard/${role}`),
  getStudyAnalytics: () => api.get('/analytics/study'),
  getPerformanceData: () => api.get('/analytics/performance'),
  getProgressReport: (timeframe) => api.get(`/analytics/progress?timeframe=${timeframe}`),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  updateSettings: (settings) => api.put('/notifications/settings', settings),
  getSettings: () => api.get('/notifications/settings'),
};

// Utility functions for file handling
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const uploadFile = async (file, endpoint, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Network status utilities
export const isOnline = () => navigator.onLine;

export const waitForOnline = () => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
};

// Cache management
export const clearApiCache = () => {
  // Clear any cached API responses if using a cache library
  localStorage.removeItem('api_cache');
};

// Request retry utility
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

export default api;
