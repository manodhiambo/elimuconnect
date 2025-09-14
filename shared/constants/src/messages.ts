// shared/constants/src/messages.ts
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',

  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Kenyan phone number',
  WEAK_PASSWORD: 'Password is too weak',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_GRADE: 'Invalid grade for the selected education level',
  INVALID_NEMIS_CODE: 'Invalid NEMIS code format',
  INVALID_TSC_NUMBER: 'Invalid TSC number format',

  // File Upload
  FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  INVALID_FILE_TYPE: 'File type not supported',
  UPLOAD_FAILED: 'File upload failed',

  // Database
  DATABASE_ERROR: 'Database operation failed',
  RECORD_NOT_FOUND: 'Record not found',
  DUPLICATE_ENTRY: 'Duplicate entry found',

  // General
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  NETWORK_ERROR: 'Network error occurred',
  INVALID_REQUEST: 'Invalid request format'
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication
  REGISTRATION_SUCCESS: 'Registration successful. Please check your email for verification.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',

  // Profile
  PROFILE_UPDATED: 'Profile updated successfully',
  AVATAR_UPLOADED: 'Avatar uploaded successfully',
  PREFERENCES_UPDATED: 'Preferences updated successfully',

  // Content
  BOOK_UPLOADED: 'Book uploaded successfully',
  PAPER_UPLOADED: 'Past paper uploaded successfully',
  QUIZ_CREATED: 'Quiz created successfully',
  QUIZ_COMPLETED: 'Quiz completed successfully',

  // Social
  MESSAGE_SENT: 'Message sent successfully',
  GROUP_CREATED: 'Study group created successfully',
  GROUP_JOINED: 'Joined study group successfully',
  DISCUSSION_POSTED: 'Discussion posted successfully',

  // General
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_SAVED: 'Data saved successfully',
  FILE_UPLOADED: 'File uploaded successfully'
} as const;

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  FORUM_REPLY: 'forum_reply',
  ASSIGNMENT: 'assignment',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system',
  FRIEND_REQUEST: 'friend_request',
  GROUP_INVITE: 'group_invite',
  QUIZ_REMINDER: 'quiz_reminder'
} as const;
