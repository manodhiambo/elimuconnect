// src/utils/api.js
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from './constants';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: { 'Content-Type': 'application/json' }
});

// Attach auth token + cache busting
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.params = { ...config.params, _t: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          window.location.href = '/login';
          break;
        case 403:
          error.message = ERROR_MESSAGES.FORBIDDEN || 'Not allowed';
          break;
        case 404:
          error.message = ERROR_MESSAGES.NOT_FOUND;
          break;
        case 422:
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
      error.message = ERROR_MESSAGES.NETWORK_ERROR;
    } else {
      error.message = error.message || 'Unexpected error occurred';
    }
    return Promise.reject(error);
  }
);

/* ---------------- AUTH API ---------------- */
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

/* ---------------- USER API ---------------- */
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  changePassword: (passwords) => api.put('/users/password', passwords),
  deleteAccount: () => api.delete('/users/account'),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (settings) => api.put('/users/settings', settings),
};

/* ---------------- SCHOOL API ---------------- */
export const schoolAPI = {
  searchSchools: async (query) => {
    try {
      if (!query || query.length < 3) return { data: { schools: [], total: 0 } };
      const res = await api.get('/schools/search', { params: { q: query, limit: 20 } });
      if (res.data.success) {
        return {
          data: {
            schools: res.data.data.schools || [],
            total: res.data.data.total || 0,
          }
        };
      }
      return { data: { schools: [], total: 0 } };
    } catch (e) {
      console.error('School search failed:', e);
      return { data: { schools: [], total: 0 } };
    }
  },
  getSchoolById: (id) => api.get(`/schools/${id}`),
  getAllSchools: (params = {}) => api.get('/schools', { params }),
  getSchoolsByCounty: (county, params = {}) => api.get(`/schools/counties/${encodeURIComponent(county)}/schools`, { params }),
  getCounties: () => api.get('/schools/counties/all'),
  getSchoolTypes: () => api.get('/schools/types/all'),
  getSchoolCategories: () => api.get('/schools/categories/all'),
  getSchoolsByRegion: (region, params = {}) => api.get(`/schools/regions/${encodeURIComponent(region)}/schools`, { params }),
  getSchoolPublicInfo: (id) => api.get(`/schools/${id}/public-info`),
  verifySchool: (id, data) => api.post(`/schools/${id}/verify`, data),
  requestVerification: (id) => api.post(`/schools/${id}/request-verification`),
  createSchool: (data) => api.post('/schools', data),
  updateSchool: (id, data) => api.put(`/schools/${id}`, data),
  deleteSchool: (id) => api.delete(`/schools/${id}`),
  uploadSchoolLogo: (id, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post(`/schools/${id}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadSchoolImages: (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post(`/schools/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteSchoolImage: (id, imgId) => api.delete(`/schools/${id}/images/${imgId}`),
  joinSchool: (id) => api.post(`/schools/${id}/join`),
  leaveSchool: (id) => api.delete(`/schools/${id}/leave`),
  getSchoolMembers: (id) => api.get(`/schools/${id}/members`),
  addSchoolAdmin: (id, userId) => api.post(`/schools/${id}/admins`, { userId }),
  removeSchoolAdmin: (id, userId) => api.delete(`/schools/${id}/admins/${userId}`),
  getSchoolAdmins: (id) => api.get(`/schools/${id}/admins`),
  getSchoolBooks: (id, params = {}) => api.get(`/schools/${id}/books`, { params }),
  getSchoolPapers: (id, params = {}) => api.get(`/schools/${id}/papers`, { params }),
  getSchoolDiscussions: (id, params = {}) => api.get(`/schools/${id}/discussions`, { params }),
  getSchoolStatistics: (id) => api.get(`/schools/${id}/stats`),
  getSchoolPerformance: (id) => api.get(`/schools/${id}/performance`),
  getSchoolSettings: (id) => api.get(`/schools/${id}/settings`),
  updateSchoolSettings: (id, settings) => api.put(`/schools/${id}/settings`, settings),
};

/* ---------------- LIBRARY API ---------------- */
export const libraryAPI = {
  getBooks: (params) => api.get('/library/books', { params }),
  getBookById: (id) => api.get(`/library/books/${id}`),
  searchBooks: (query, filters) => api.get('/library/search', { params: { q: query, ...filters } }),
  getBookmarks: () => api.get('/library/bookmarks'),
  addBookmark: (bookId, page) => api.post('/library/bookmarks', { bookId, page }),
  removeBookmark: (bookmarkId) => api.delete(`/library/bookmarks/${bookmarkId}`),
  getReadingProgress: (bookId) => api.get(`/library/progress/${bookId}`),
  updateReadingProgress: (bookId, progress) => api.put(`/library/progress/${bookId}`, progress),
  downloadBook: (bookId) => api.get(`/library/books/${bookId}/download`, { responseType: 'blob' }),
};

/* ---------------- PAPERS API ---------------- */
export const papersAPI = {
  getPapers: (params) => api.get('/papers', { params }),
  getPaperById: (id) => api.get(`/papers/${id}`),
  searchPapers: (query, filters) => api.get('/papers/search', { params: { q: query, ...filters } }),
  downloadPaper: (id) => api.get(`/papers/${id}/download`, { responseType: 'blob' }),
  getMarkingScheme: (id) => api.get(`/papers/${id}/marking-scheme`),
  submitTest: (data) => api.post('/papers/tests', data),
  getTestResults: (id) => api.get(`/papers/tests/${id}/results`),
};

/* ---------------- FORUM API ---------------- */
export const forumAPI = {
  getPosts: (params) => api.get('/forums/posts', { params }),
  getPostById: (id) => api.get(`/forums/posts/${id}`),
  createPost: (data) => api.post('/forums/posts', data),
  updatePost: (id, data) => api.put(`/forums/posts/${id}`, data),
  deletePost: (id) => api.delete(`/forums/posts/${id}`),
  getComments: (postId) => api.get(`/forums/posts/${postId}/comments`),
  addComment: (postId, comment) => api.post(`/forums/posts/${postId}/comments`, comment),
  votePost: (postId, vote) => api.post(`/forums/posts/${postId}/vote`, { vote }),
  getCategories: () => api.get('/forums/categories'),
};

/* ---------------- MESSAGES API ---------------- */
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (id) => api.get(`/messages/conversations/${id}`),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  searchUsers: (query) => api.get(`/messages/users/search?q=${encodeURIComponent(query)}`),
};

/* ---------------- ANALYTICS API ---------------- */
export const analyticsAPI = {
  getProgress: (userId) => api.get(`/analytics/progress/${userId}`),
  getPerformance: (userId, subject) => api.get(`/analytics/performance/${userId}`, { params: { subject } }),
  getLeaderboard: (type) => api.get(`/analytics/leaderboard/${type}`),
  logActivity: (data) => api.post('/analytics/activity', data),
};

/* ---------------- NOTIFICATIONS API ---------------- */
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  subscribeToNotifications: (subscription) => api.post('/notifications/subscribe', subscription),
};

/* ---------------- UTILITIES ---------------- */
export const uploadFile = async (file, type = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const res = await api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => console.log('Upload progress:', Math.round((e.loaded * 100) / e.total)),
  });
  return res.data;
};

export const retryRequest = async (fn, maxRetries = API_CONFIG.retries) => {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try { return await fn(); } 
    catch (err) {
      lastError = err;
      if (err.response && err.response.status >= 400 && err.response.status < 500) throw err;
      if (i < maxRetries) await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
    }
  }
  throw lastError;
};

export const isOnline = () => navigator.onLine;

export const handleOfflineRequest = (data) => {
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]');
  queue.push({ ...data, timestamp: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(queue));
};

export const processOfflineQueue = async () => {
  if (!isOnline()) return;
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_DATA) || '[]');
  for (const req of queue) {
    try { await api.request(req); } 
    catch (err) { console.error('Failed offline req:', err); }
  }
  localStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
};

window.addEventListener('online', processOfflineQueue);

/* ---------------- DEBUG (DEV ONLY) ---------------- */
export const debugAPI = {
  testSchoolSearch: (query = 'Alliance') => schoolAPI.searchSchools(query),
  testAllSchoolEndpoints: async () => {
    const tests = [
      { name: 'Search Schools', fn: () => schoolAPI.searchSchools('test') },
      { name: 'Get Counties', fn: () => schoolAPI.getCounties() },
      { name: 'Get Types', fn: () => schoolAPI.getSchoolTypes() },
      { name: 'Get Categories', fn: () => schoolAPI.getSchoolCategories() },
    ];
    for (const t of tests) {
      try { console.log(`✅ ${t.name}:`, await t.fn()); }
      catch (e) { console.error(`❌ ${t.name}`, e); }
    }
  }
};

if (process.env.NODE_ENV === 'development') {
  window.debugAPI = debugAPI;
}

/* ---------------- EXPORTS ---------------- */
export { api };
export default api;
