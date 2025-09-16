import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Main authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token required', 401));
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(new AppError('Authentication token required', 401));
    }

    const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'your-secret-key')) as JwtPayload;
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // Check if user is active (manual check since we removed the virtual)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (user.lastActive <= oneWeekAgo) {
      return next(new AppError('Account is inactive', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError('Token has expired', 401));
    }
    if (error instanceof JsonWebTokenError) {
      return next(new AppError('Invalid token', 401));
    }
    return next(new AppError('Authentication failed', 401));
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'your-secret-key')) as JwtPayload;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without setting user
    next();
  }
};

// Role-based authorization
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['admin', 'school_admin']);

// Teacher or admin middleware
export const requireTeacherOrAdmin = requireRole(['teacher', 'admin', 'school_admin']);

// Email verification requirement
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Use the 'verified' field from your model instead of 'isEmailVerified'
  if (!req.user.verified) {
    return next(new AppError('Email verification required', 403));
  }

  next();
};

// School member verification
export const requireSchoolMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { schoolId } = req.params;
    
    // Check if user belongs to the school - use profile.school
    if (!req.user.profile.school || req.user.profile.school.toString() !== schoolId) {
      return next(new AppError('School membership required', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// API key authentication (for external services)
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return next(new AppError('API key required', 401));
  }

  // Verify API key
  if (apiKey !== process.env.API_KEY) {
    return next(new AppError('Invalid API key', 401));
  }

  next();
};

// Rate limiting check for authenticated users
export const checkUserRateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    return next();
  }

  // Add user-specific rate limiting logic here
  // For now, just continue
  next();
};

export default authMiddleware;
