// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

// App Configuration
export const APP_NAME = 'ElimuConnect';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Kenyan Educational Platform';

// Authentication
export const TOKEN_KEY = 'elimuconnect_token';
export const USER_KEY = 'elimuconnect_user';
export const REFRESH_TOKEN_KEY = 'elimuconnect_refresh_token';

// Local Storage Keys
export const THEME_KEY = 'elimuconnect_theme';
export const LANGUAGE_KEY = 'elimuconnect_language';
export const SETTINGS_KEY = 'elimuconnect_settings';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY: '/verify',
  DASHBOARD: '/dashboard',
  LIBRARY: '/library',
  PAPERS: '/papers',
  FORUM: '/forum',
  MESSAGES: '/messages',
  GROUPS: '/groups',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

// Education Levels
export const EDUCATION_LEVELS = {
  PRIMARY: 'Primary',
  SECONDARY: 'Secondary',
};

// Kenyan Education Subjects
export const SUBJECTS = {
  PRIMARY: [
    'Mathematics',
    'English',
    'Kiswahili',
    'Science',
    'Social Studies',
    'Religious Education',
    'Life Skills',
    'Creative Arts',
    'Physical Education'
  ],
  SECONDARY: [
    'Mathematics',
    'English',
    'Kiswahili',
    'Biology',
    'Chemistry',
    'Physics',
    'Geography',
    'History',
    'Computer Studies',
    'Business Studies',
    'Agriculture',
    'French',
    'German',
    'Art & Design',
    'Music',
    'Physical Education'
  ]
};

// Kenyan Counties
export const KENYAN_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
    AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg']
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+254|254|0)?[17]\d{8}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Forum Categories
export const FORUM_CATEGORIES = [
  { id: 'mathematics', name: 'Mathematics', icon: '🔢' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'english', name: 'English', icon: '📖' },
  { id: 'kiswahili', name: 'Kiswahili', icon: '🇰🇪' },
  { id: 'general', name: 'General Discussion', icon: '💭' },
  { id: 'homework', name: 'Homework Help', icon: '📝' },
  { id: 'study-tips', name: 'Study Tips', icon: '💡' },
  { id: 'career', name: 'Career Guidance', icon: '🎯' },
];

// Achievement Types
export const ACHIEVEMENTS = {
  FIRST_LOGIN: {
    id: 'first_login',
    name: 'Welcome!',
    description: 'Completed your first login',
    icon: '🎉',
    points: 10
  },
  BOOKWORM: {
    id: 'bookworm',
    name: 'Bookworm',
    description: 'Read 5 books',
    icon: '📚',
    points: 50
  },
  SOCIAL_LEARNER: {
    id: 'social_learner',
    name: 'Social Learner',
    description: 'Participated in 10 discussions',
    icon: '💬',
    points: 30
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintained a 7-day study streak',
    icon: '🏆',
    points: 100
  },
  HELPFUL_STUDENT: {
    id: 'helpful_student',
    name: 'Helpful Student',
    description: 'Helped 5 other students',
    icon: '🤝',
    points: 75
  }
};

// Quiz/Assessment Types
export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  FILL_IN_BLANK: 'fill_in_blank'
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  VOICE: 'voice',
  VIDEO: 'video'
};

// Study Group Types
export const STUDY_GROUP_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SCHOOL_ONLY: 'school_only'
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Language Options
export const LANGUAGES = {
  ENGLISH: 'en',
  KISWAHILI: 'sw'
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'dddd, MMMM Do, YYYY',
  TIME: 'HH:mm',
  DATETIME: 'DD/MM/YYYY HH:mm'
};

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  USERS: {
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings',
    PROGRESS: '/users/progress'
  },
  LIBRARY: {
    BOOKS: '/books',
    SEARCH: '/books/search',
    BOOKMARKS: '/books/bookmarks'
  },
  PAPERS: {
    LIST: '/papers',
    SEARCH: '/papers/search',
    DOWNLOAD: '/papers/download'
  },
  FORUM: {
    DISCUSSIONS: '/forum/discussions',
    CATEGORIES: '/forum/categories',
    REPLIES: '/forum/replies'
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    SEND: '/messages/send'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  UNKNOWN_ERROR: 'An unknown error occurred.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Registration successful! Please verify your account.',
  VERIFICATION_SUCCESS: 'Account verified successfully!',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  BOOKMARK_ADDED: 'Bookmark added!',
  BOOKMARK_REMOVED: 'Bookmark removed!'
};

// Local Storage Helpers
export const STORAGE_KEYS = {
  TOKEN: TOKEN_KEY,
  USER: USER_KEY,
  THEME: THEME_KEY,
  LANGUAGE: LANGUAGE_KEY,
  SETTINGS: SETTINGS_KEY,
  OFFLINE_DATA: 'elimuconnect_offline_data',
  LAST_SYNC: 'elimuconnect_last_sync'
};

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: THEMES.LIGHT,
  language: LANGUAGES.ENGLISH,
  notifications: {
    email: true,
    push: true,
    messages: true,
    discussions: true,
    assignments: true
  },
  privacy: {
    profileVisible: true,
    showOnlineStatus: true,
    allowMessages: true
  },
  study: {
    dailyGoal: 60, // minutes
    reminderEnabled: true,
    reminderTime: '18:00'
  }
};

// Cache Keys
export const CACHE_KEYS = {
  BOOKS: 'books_cache',
  PAPERS: 'papers_cache',
  DISCUSSIONS: 'discussions_cache',
  USER_PROFILE: 'user_profile_cache',
  SCHOOLS: 'schools_cache'
};

// Time Constants
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
};

// Export all constants as default
export default {
  API_BASE_URL,
  SOCKET_URL,
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  ROUTES,
  USER_ROLES,
  EDUCATION_LEVELS,
  SUBJECTS,
  KENYAN_COUNTIES,
  FILE_UPLOAD,
  PAGINATION,
  VALIDATION,
  NOTIFICATION_TYPES,
  FORUM_CATEGORIES,
  ACHIEVEMENTS,
  QUIZ_TYPES,
  MESSAGE_TYPES,
  STUDY_GROUP_TYPES,
  THEMES,
  LANGUAGES,
  DATE_FORMATS,
  ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  CACHE_KEYS,
  TIME_CONSTANTS
};
