// Export all middleware from a central location

// Auth middleware exports
export { 
  authMiddleware, 
  optionalAuthMiddleware,
  authorize, 
  authorizeOwnerOrAdmin,
  requireEmailVerification,
  requireSchoolMembership,
  requireAdminOrSchoolAdmin,
  requireTeacherOrAdmin,
  apiKeyAuth,
  validateSession,
  checkUserRateLimit,
  requireTwoFactor,
  verifyDevice,
  blacklistToken,
  removeFromBlacklist,
  isTokenBlacklisted,
  cleanupBlacklist,
  logUserActivity,
  checkAccountStatus,
  requireElevatedPermissions
} from './auth.middleware';

// CORS middleware
export { corsMiddleware, handlePreflightCors } from './cors.middleware';

// Error middleware
export { 
  errorMiddleware, 
  notFoundMiddleware, 
  asyncHandler,
  mongoErrorHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler
} from './error.middleware';

// Rate limit middleware
export { 
  rateLimitMiddleware, 
  generalRateLimit,
  progressiveRateLimit,
  createUserRateLimit,
  roleBasedRateLimit,
  bypassRateLimit,
  slidingWindowRateLimit,
  ipFilterRateLimit,
  getRateLimitStats,
  clearRateLimit,
  addRateLimitHeaders,
  cleanupRateLimit
} from './rateLimit.middleware';

// Upload middleware
export { 
  uploadMiddleware,
  handleUploadError,
  cleanupTempFiles,
  validateUploadedFile,
  getFileInfo
} from './upload.middleware';

// Validation middleware
export { 
  validationMiddleware, 
  validateMultiple, 
  sanitizeInput,
  validateFileUpload,
  validateJsonSchema,
  validateBusinessRules,
  validateRateLimit
} from './validation.middleware';

// Re-export everything for convenience
export * from './auth.middleware';
export * from './cors.middleware';
export * from './error.middleware';
export * from './rateLimit.middleware';
export * from './upload.middleware';
export * from './validation.middleware';
