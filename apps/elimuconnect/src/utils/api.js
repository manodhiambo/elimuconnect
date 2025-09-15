import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from './constants';

// Create axios instance with proper baseURL configuration
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to prevent caching issues
    config.params = {
      ...config.params,
      _t: new Date().getTime()
    };
    
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          error.message = 'You do not have permission to perform this action';
          break;
        case 404:
          error.message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 422:
          // Validation error
          error.message = data.message || ERROR_MESSAGES.VALIDATION_ERROR;
          error.validationErrors = data.errors;
          break;
        case 500:
          error.message = ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          error.message = data.message || ERROR_MESSAGES.SERVER_ERROR;
      }
    } else if (error.request) {
      // Network error
      error.message = ERROR_MESSAGES.NETWORK_ERROR;
    } else {
      // Something else happened
      error.message = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyAccount: (token) => api.post('/auth/verify', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  changePassword: (passwords) => api.put('/users/password', passwords),
  deleteAccount: () => api.delete('/users/account'),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (settings) => api.put('/users/settings', settings),
};

export const schoolAPI = {
  searchSchools: (query) => api.get(`/schools/search?q=${encodeURIComponent(query)}`),
  getSchoolById: (id) => api.get(`/schools/${id}`),
  verifySchool: (schoolData) => api.post('/schools/verify', schoolData),
};

export const libraryAPI = {
  getBooks: (params) => api.get('/library/books', { params }),
  getBookById: (id) => api.get(`/library/books/${id}`),
  searchBooks: (query, filters) => api.get('/library/search', { 
    params: { q: query, ...filters } 
  }),
  getBookmarks: () => api.get('/library/bookmarks'),
  addBookmark: (bookId, page) => api.post('/library/bookmarks', { bookId, page }),
  removeBookmark: (bookmarkId) => api.delete(`/library/bookmarks/${bookmarkId}`),
  getReadingProgress: (bookId) => api.get(`/library/progress/${bookId}`),
  updateReadingProgress: (bookId, progress) => api.put(`/library/progress/${bookId}`, progress),
  downloadBook: (bookId) => api.get(`/library/books/${bookId}/download`, { 
    responseType: 'blob' 
  }),
};

export const papersAPI = {
  getPapers: (params) => api.get('/papers', { params }),
  getPaperById: (id) => api.get(`/papers/${id}`),
  searchPapers: (query, filters) => api.get('/papers/search', { 
    params: { q: query, ...filters } 
  }),
  downloadPaper: (paperId) => api.get(`/papers/${paperId}/download`, { 
    responseType: 'blob' 
  }),
  getMarkingScheme: (paperId) => api.get(`/papers/${paperId}/marking-scheme`),
  submitTest: (testData) => api.post('/papers/tests', testData),
  getTestResults: (testId) => api.get(`/papers/tests/${testId}/results`),
};

export const forumAPI = {
  getPosts: (params) => api.get('/forums/posts', { params }),
  getPostById: (id) => api.get(`/forums/posts/${id}`),
  createPost: (postData) => api.post('/forums/posts', postData),
  updatePost: (id, postData) => api.put(`/forums/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/forums/posts/${id}`),
  getComments: (postId) => api.get(`/forums/posts/${postId}/comments`),
  addComment: (postId, comment) => api.post(`/forums/posts/${postId}/comments`, comment),
  votePost: (postId, vote) => api.post(`/forums/posts/${postId}/vote`, { vote }),
  getCategories: () => api.get('/forums/categories'),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (messageData) => api.post('/messages', messageData),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  searchUsers: (query) => api.get(`/messages/users/search?q=${encodeURIComponent(query)}`),
};

export const analyticsAPI = {
  getProgress: (userId) => api.get(`/analytics/progress/${userId}`),
  getPerformance: (userId, subject) => api.get(`/analytics/performance/${userId}`, { 
    params: { subject } 
  }),
  getLeaderboard: (type) => api.get(`/analytics/leaderboard/${type}`),
  logActivity: (activityData) => api.post('/analytics/activity', activityData),
};

// File upload utility
export const uploadFile = async (file, type = 'general') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('Upload progress:', percentCompleted);
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Retry utility for failed requests
export const retryRequest = async (requestFn, maxRetries = API_CONFIG.retries) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s...
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Check if user is online
export const isOnline = () => {
  return navigator.onLine;
};

// Handle offline requests
export const handleOfflineRequest = (requestData) => {
  const offlineQueue = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]'
  );
  
  offlineQueue.push({
    ...requestData,
    timestamp: new Date().toISOString(),
  });
  
  localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(offlineQueue));
};

// Process offline queue when back online
export const processOfflineQueue = async () => {
  if (!isOnline()) return;
  
  const offlineQueue = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]'
  );
  
  if (offlineQueue.length === 0) return;
  
  console.log('Processing offline queue:', offlineQueue.length, 'items');
  
  for (const request of offlineQueue) {
    try {
      await api.request(request);
      console.log('Offline request processed:', request);
    } catch (error) {
      console.error('Failed to process offline request:', error);
    }
  }
  
  // Clear processed queue
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  subscribeToNotifications: (subscription) => api.post('/notifications/subscribe', subscription),
};

// Listen for online/offline events
window.addEventListener('online', processOfflineQueue);

// Export the main api instance as both default and named export
export { api };
export default api;
