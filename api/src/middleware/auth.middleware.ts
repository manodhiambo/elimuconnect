import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// Import types
import '../types/express';

// JWT token interface
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set<string>();

// Main authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback: Get token from cookies
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Fallback: Get token from query parameter (for file downloads, websockets)
    if (!token && req.query?.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    // Check if token exists
    if (!token) {
      throw new AppError('Access token is required', 401);
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      throw new AppError('Token has been revoked', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Check if user account is active
      if (!user.isActive) {
        throw new AppError('User account is deactivated', 401);
      }

      // Check if user's email is verified for sensitive operations
      if (req.path.includes('/admin') || req.path.includes('/upload')) {
        if (!user.isEmailVerified) {
          throw new AppError('Email verification required for this action', 403);
        }
      }

      // Add user and token to request object
      req.user = user;
      req.token = token;

      // Log successful authentication
      logger.debug('User authenticated successfully', {
        userId: user.id,
        email: user.email,
        role: user.role,
        route: req.path,
        method: req.method,
        ip: req.ip
      });

      next();
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError('Access token has expired', 401);
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new AppError('Invalid access token', 401);
      } else if (jwtError.name === 'NotBeforeError') {
        throw new AppError('Token not active yet', 401);
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      route: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next(error);
  }
};

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Get token from cookies if not in header
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
        
        logger.debug('Optional authentication successful', {
          userId: user.id,
          route: req.path
        });
      }
    } catch (jwtError) {
      // Log error but don't throw - this is optional auth
      logger.debug('Optional authentication failed', {
        error: jwtError instanceof Error ? jwtError.message : 'Unknown error',
        route: req.path
      });
    }

    next();
  } catch (error) {
    // Don't throw errors in optional auth
    logger.debug('Optional authentication error', error);
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed - insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        route: req.path,
        method: req.method
      });
      
      return next(new AppError('Insufficient permissions', 403));
    }

    logger.debug('Authorization successful', {
      userId: req.user.id,
      userRole: req.user.role,
      route: req.path
    });

    next();
  };
};

// Check if user owns resource or has admin privileges
export const authorizeOwnerOrAdmin = (getUserId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const resourceUserId = getUserId(req);
    const isOwner = req.user.id.toString() === resourceUserId;
    const isAdmin = ['admin', 'school_admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      logger.warn('Authorization failed - not owner or admin', {
        userId: req.user.id,
        resourceUserId,
        userRole: req.user.role,
        route: req.path
      });
      
      return next(new AppError('Access denied - insufficient permissions', 403));
    }

    logger.debug('Owner/Admin authorization successful', {
      userId: req.user.id,
      isOwner,
      isAdmin,
      route: req.path
    });

    next();
  };
};

// Require email verification
export const requireEmailVerification = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.isEmailVerified) {
    logger.warn('Email verification required', {
      userId: req.user.id,
      email: req.user.email,
      route: req.path
    });
    
    return next(new AppError('Email verification required', 403));
  }

  next();
};

// School membership verification
export const requireSchoolMembership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { schoolId } = req.params;
    
    // Check if user belongs to the school
    if (!req.user.school || req.user.school.toString() !== schoolId) {
      logger.warn('School membership required', {
        userId: req.user.id,
        userSchool: req.user.school,
        requiredSchool: schoolId,
        route: req.path
      });
      
      return next(new AppError('School membership required', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Admin or school admin authorization
export const requireAdminOrSchoolAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!['admin', 'school_admin'].includes(req.user.role)) {
    return next(new AppError('Admin privileges required', 403));
  }

  next();
};

// Teacher or admin authorization
export const requireTeacherOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!['teacher', 'admin', 'school_admin'].includes(req.user.role)) {
    return next(new AppError('Teacher privileges required', 403));
  }

  next();
};

// API key authentication (for external services)
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return next(new AppError('API key required', 401));
  }

  // Verify API key (in production, store in database)
  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key attempt', {
      providedKey: apiKey.substring(0, 8) + '...',
      ip: req.ip,
      route: req.path
    });
    
    return next(new AppError('Invalid API key', 401));
  }

  logger.debug('API key authentication successful', {
    apiKey: apiKey.substring(0, 8) + '...',
    route: req.path
  });

  next();
};

// Session-based authentication check
export const validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.token) {
      return next(new AppError('Authentication required', 401));
    }

    // Decode token to get session info
    const decoded = jwt.decode(req.token) as JWTPayload;
    
    if (decoded.sessionId) {
      // In production, validate session against database/Redis
      // For now, we'll just check if the token is still valid
      logger.debug('Session validation successful', {
        userId: req.user.id,
        sessionId: decoded.sessionId
      });
    }

    next();
  } catch (error) {
    next(new AppError('Session validation failed', 401));
  }
};

// Rate limiting check for authenticated users
export const checkUserRateLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    return next();
  }

  // Add user-specific rate limiting logic here
  // For now, just continue - this would integrate with rate limiting service
  logger.debug('User rate limit check passed', {
    userId: req.user.id,
    route: req.path
  });
  
  next();
};

// Two-factor authentication middleware
export const requireTwoFactor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if user has 2FA enabled and verified
    const twoFactorHeader = req.headers['x-2fa-token'] as string;
    
    // For now, we'll skip 2FA check if not implemented
    // In production, this would verify the 2FA token
    if (req.user.role === 'admin' && !twoFactorHeader) {
      logger.warn('Two-factor authentication required for admin', {
        userId: req.user.id,
        route: req.path
      });
      
      return next(new AppError('Two-factor authentication required', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Device verification middleware
export const verifyDevice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const deviceId = req.headers['x-device-id'] as string;
    const userAgent = req.get('User-Agent');

    // In production, verify device against registered devices
    logger.debug('Device verification', {
      userId: req.user.id,
      deviceId,
      userAgent,
      route: req.path
    });

    next();
  } catch (error) {
    next(error);
  }
};

// Token blacklist management
export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
  logger.info('Token blacklisted', {
    tokenPrefix: token.substring(0, 10) + '...'
  });
};

export const removeFromBlacklist = (token: string): void => {
  tokenBlacklist.delete(token);
  logger.info('Token removed from blacklist', {
    tokenPrefix: token.substring(0, 10) + '...'
  });
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// Cleanup expired blacklisted tokens (call periodically)
export const cleanupBlacklist = (): void => {
  const now = Math.floor(Date.now() / 1000);
  let cleanedCount = 0;

  for (const token of tokenBlacklist) {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (decoded && decoded.exp && decoded.exp < now) {
        tokenBlacklist.delete(token);
        cleanedCount++;
      }
    } catch (error) {
      // If we can't decode the token, remove it from blacklist
      tokenBlacklist.delete(token);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    logger.info(`Cleaned up ${cleanedCount} expired tokens from blacklist`);
  }
};

// Generate secure session ID
export const generateSessionId = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Middleware to log user activity
export const logUserActivity = (activityType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user) {
      // In production, this would save to database
      logger.info('User activity logged', {
        userId: req.user.id,
        activityType,
        route: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

// Middleware to check account suspension
export const checkAccountStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if account is suspended or banned
    // In production, this would check a suspension table in database
    const isSuspended = false; // Placeholder
    const isBanned = false; // Placeholder

    if (isBanned) {
      logger.warn('Banned user attempted access', {
        userId: req.user.id,
        route: req.path
      });
      return next(new AppError('Account has been permanently banned', 403));
    }

    if (isSuspended) {
      logger.warn('Suspended user attempted access', {
        userId: req.user.id,
        route: req.path
      });
      return next(new AppError('Account is temporarily suspended', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for gradual permission escalation
export const requireElevatedPermissions = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      // Check if user recently authenticated (within last 5 minutes for sensitive actions)
      const recentAuthHeader = req.headers['x-recent-auth'] as string;
      const sensitiveActions = ['delete_account', 'change_password', 'admin_action'];

      if (sensitiveActions.includes(action) && !recentAuthHeader) {
        logger.warn('Elevated permissions required', {
          userId: req.user.id,
          action,
          route: req.path
        });
        
        return next(new AppError('Recent authentication required for this action', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export all middleware functions
export default authMiddleware;
