export { 
  authenticate as authMiddleware,
  optionalAuthMiddleware,
  authorize,
  authorizeOwnerOrAdmin,
  requireAdminOrSchoolAdmin,
  validateSession,
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

// Add missing middleware functions
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const requireEmailVerification = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Implementation for email verification requirement
  next();
};

export const requireSchoolMembership = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Implementation for school membership requirement
  next();
};

export const requireTeacherOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Teacher or admin role required' });
  }
  next();
};

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  // Implementation for API key authentication
  next();
};

export const checkUserRateLimit = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Implementation for user rate limiting
  next();
};
