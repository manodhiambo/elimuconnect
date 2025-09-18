// File: shared/constants/src/messages.ts

export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_UPDATED: 'Password updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  DISCUSSION_CREATED: 'Discussion created successfully',
  REPLY_POSTED: 'Reply posted successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  NOTIFICATION_MARKED_READ: 'Notification marked as read',
  SETTINGS_SAVED: 'Settings saved successfully'
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  WEAK_PASSWORD: 'Password must be at least 8 characters long',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error occurred',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  DISCUSSION_NOT_FOUND: 'Discussion not found',
  REPLY_NOT_FOUND: 'Reply not found',
  PERMISSION_DENIED: 'Permission denied'
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MISMATCH: 'Passwords do not match',
  MIN_LENGTH: 'Minimum length required',
  MAX_LENGTH: 'Maximum length exceeded',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  NUMERIC_ONLY: 'Only numbers allowed',
  ALPHABETIC_ONLY: 'Only letters allowed'
} as const;

export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  SEARCHING: 'Searching...',
  NO_RESULTS: 'No results found',
  EMPTY_STATE: 'Nothing to show yet',
  COMING_SOON: 'Feature coming soon',
  UNDER_MAINTENANCE: 'Under maintenance'
} as const;
