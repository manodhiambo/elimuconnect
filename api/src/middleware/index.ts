export { auth as authenticate, requireRole as authorize, requireEmailVerification } from './auth';
export { auth as authMiddleware } from './auth';

// Stub implementations for missing middleware
export const optionalAuthMiddleware = (req: any, res: any, next: any) => next();
export const authorizeOwnerOrAdmin = (req: any, res: any, next: any) => next();
export const requireAdminOrSchoolAdmin = (req: any, res: any, next: any) => next();
export const validateSession = (req: any, res: any, next: any) => next();
export const requireTwoFactor = (req: any, res: any, next: any) => next();
export const verifyDevice = (req: any, res: any, next: any) => next();
export const blacklistToken = (req: any, res: any, next: any) => next();
export const removeFromBlacklist = (req: any, res: any, next: any) => next();
export const isTokenBlacklisted = (req: any, res: any, next: any) => next();
export const cleanupBlacklist = (req: any, res: any, next: any) => next();
export const logUserActivity = (req: any, res: any, next: any) => next();
export const checkAccountStatus = (req: any, res: any, next: any) => next();
export const requireElevatedPermissions = (req: any, res: any, next: any) => next();
