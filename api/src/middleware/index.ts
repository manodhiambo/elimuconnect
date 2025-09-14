// api/src/middleware/index.ts - Export all middleware
export { authenticateToken, requireRole, requireAdmin, requireTeacher } from './auth.middleware';
export { validateRequest, validateQuery, validateParams } from './validation.middleware';
export { rateLimiter } from './rateLimit.middleware';
export { upload } from './upload.middleware';
export { errorHandler, notFound } from './error.middleware';
export { corsOptions } from './cors.middleware';
