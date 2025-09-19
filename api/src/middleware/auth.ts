import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    (req as AuthenticatedRequest).user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Additional exports for compatibility
export const auth = authMiddleware;

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authRequest = req as AuthenticatedRequest;
    if (!authRequest.user || !roles.includes(authRequest.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

export const requireEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
  const authRequest = req as AuthenticatedRequest;
  const user = await User.findById(authRequest.user?.userId);
  
  if (!user || !user.isEmailVerified) {
    return res.status(403).json({ message: 'Email verification required' });
  }
  next();
};
