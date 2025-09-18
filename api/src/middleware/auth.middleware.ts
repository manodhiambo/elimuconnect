import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ApiError } from '../utils/ApiResponse';
import { StatusCodes } from 'http-status-codes';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        new ApiError('Access token is required')
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        new ApiError('Invalid token')
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json(
      new ApiError('Invalid or expired token')
    );
  }
};

export const optionalAuthMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        new ApiError('Authentication required')
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json(
        new ApiError('Insufficient permissions')
      );
    }

    next();
  };
};

export const authorizeOwnerOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        new ApiError('Authentication required')
      );
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
      return next();
    }

    return res.status(StatusCodes.FORBIDDEN).json(
      new ApiError('You can only access your own resources')
    );
  };
};

export const requireAdminOrSchoolAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json(
      new ApiError('Authentication required')
    );
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(StatusCodes.FORBIDDEN).json(
      new ApiError('Admin privileges required')
    );
  }

  next();
};

export const validateSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        new ApiError('Authentication required')
      );
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.verified) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        new ApiError('Account not verified or does not exist')
      );
    }

    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
      new ApiError('Session validation failed')
    );
  }
};

export const requireTwoFactor = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  next();
};

export const verifyDevice = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  next();
};

const blacklistedTokens = new Set<string>();

export const blacklistToken = (token: string) => {
  blacklistedTokens.add(token);
};

export const removeFromBlacklist = (token: string) => {
  blacklistedTokens.delete(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};

export const cleanupBlacklist = () => {
  blacklistedTokens.clear();
};

export const logUserActivity = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user) {
    console.log(`User ${req.user._id} accessed ${req.method} ${req.path}`);
  }
  next();
};

export const checkAccountStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next();
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json(
        new ApiError('User account not found')
      );
    }

    if (!user.verified) {
      return res.status(StatusCodes.FORBIDDEN).json(
        new ApiError('Account not verified')
      );
    }

    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
      new ApiError('Account status check failed')
    );
  }
};

export const requireElevatedPermissions = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json(
      new ApiError('Authentication required')
    );
  }

  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(StatusCodes.FORBIDDEN).json(
      new ApiError('Elevated permissions required')
    );
  }

  next();
};

export default authenticate;
