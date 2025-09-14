/ shared/constants/src/app.ts
export const APP_CONFIG = {
  NAME: 'ElimuConnect',
  VERSION: '1.0.0',
  DESCRIPTION: 'Educational platform for Kenyan students',
  SUPPORT_EMAIL: 'support@elimuconnect.com',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'txt'],
    AUDIO: ['mp3', 'wav', 'ogg'],
    VIDEO: ['mp4', 'webm', 'avi']
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  SCHOOL_DATA: 'school:data:',
  BOOK_DETAILS: 'book:details:',
  QUIZ_RESULTS: 'quiz:results:',
  LEADERBOARD: 'leaderboard:',
  TRENDING_DISCUSSIONS: 'discussions:trending'
};

export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  UPLOAD: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 20
  }
};
