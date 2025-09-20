// API Configuration
export const API_CONFIG = {
  baseURL: 'http://localhost:5000/api', // Fixed to use correct port
  timeout: 10000,
  retries: 3
};

// App Configuration
export const APP_CONFIG = {
  name: 'ElimuConnect',
  version: '1.0.0',
  description: 'Kenyan Educational Platform',
  supportEmail: 'support@elimuconnect.ke',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif']
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  LIBRARY: '/library',
  PAPERS: '/papers',
  FORUMS: '/forums',
  MESSAGES: '/messages',
  SETTINGS: '/settings',
  ADMIN: '/admin'
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

// Education Levels
export const EDUCATION_LEVELS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary'
};

// Primary School Classes
export const PRIMARY_CLASSES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8'
];

// Secondary School Forms
export const SECONDARY_FORMS = [
  'Form 1', 'Form 2', 'Form 3', 'Form 4'
];

// Subjects
export const SUBJECTS = {
  PRIMARY: [
    'Mathematics', 'English', 'Kiswahili', 'Science',
    'Social Studies', 'Religious Education', 'Creative Arts'
  ],
  SECONDARY: [
    'Mathematics', 'English', 'Kiswahili', 'Biology',
    'Chemistry', 'Physics', 'History', 'Geography',
    'Business Studies', 'Computer Studies', 'Agriculture'
  ]
};

// Kenyan Counties
export const COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot'
];

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'elimu_auth_token',
  USER_DATA: 'elimu_user_data',
  THEME: 'elimu_theme',
  LANGUAGE: 'elimu_language',
  OFFLINE_DATA: 'elimu_offline_data',
  READING_PROGRESS: 'elimu_reading_progress'
};

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Language Configuration
export const LANGUAGES = {
  EN: 'en',
  SW: 'sw' // Swahili
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// File Upload Limits
export const UPLOAD_LIMITS = {
  AVATAR: {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ['image/jpeg', 'image/png', 'image/gif']
  },
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

// Extension Configuration (if using Chrome extension)
export const EXTENSION_CONFIG = {
  id: 'elimuconnect-extension',
  permissions: ['storage', 'activeTab'],
  version: '1.0.0'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file format.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful! Please verify your account.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
  MESSAGE_SENT: 'Message sent successfully!'
};
