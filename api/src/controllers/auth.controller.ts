mport { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthController {
  
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, school, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        school,
        role: role || 'student',
        isEmailVerified: false,
        isActive: true
      });

      await user.save();

      // Generate auth tokens
      const tokens = this.generateTokens(user.id);

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, rememberMe } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new AppError('Account is deactivated. Please contact support.', 403);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id, rememberMe);

      // Update last login
      await User.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });

      logger.info(`User logged in: ${user.email}`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture
        },
        tokens
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      // In a real application, you would invalidate the token here
      logger.info(`User logged out: ${userId}`);

      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      if (decoded.type !== 'email_verification') {
        throw new AppError('Invalid token type', 400);
      }

      // Mark email as verified
      await User.findByIdAndUpdate(decoded.userId, { isEmailVerified: true });

      logger.info(`Email verified for user: ${decoded.userId}`);

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError('Verification token has expired', 400));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid verification token', 400));
      }
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }

      // Generate reset token
      const resetToken = this.generatePasswordResetToken(user.id);

      // In a real application, you would send this token via email
      logger.info(`Password reset requested for: ${email}`);

      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Remove this in production - only for testing
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      // Verify the reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      if (decoded.type !== 'password_reset') {
        throw new AppError('Invalid token type', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

      logger.info(`Password reset completed for user: ${decoded.userId}`);

      res.json({ message: 'Password reset successful. Please log in with your new password.' });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError('Reset token has expired', 400));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid reset token', 400));
      }
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newTokens = this.generateTokens(user.id);

      res.json({
        message: 'Tokens refreshed successfully',
        tokens: newTokens
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError('Refresh token has expired', 401));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid refresh token', 401));
      }
      next(error);
    }
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          school: user.school,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await User.findByIdAndUpdate(userId, { password: hashedPassword });

      logger.info(`Password changed for user: ${userId}`);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  };

  resendVerificationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.isEmailVerified) {
        throw new AppError('Email is already verified', 400);
      }

      // Generate verification token
      const verificationToken = this.generateVerificationToken(user.id);

      // In a real application, you would send this via email
      logger.info(`Verification email resent to: ${user.email}`);

      res.json({ 
        message: 'Verification email sent successfully',
        // Remove this in production - only for testing
        verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
      });
    } catch (error) {
      next(error);
    }
  };

  // Helper methods
  private generateTokens(userId: string, rememberMe: boolean = false) {
    const payload = {
      userId,
      sessionId: this.generateSessionId()
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h'
    });

    const refreshTokenExpiry = rememberMe ? '30d' : '7d';
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
      expiresIn: refreshTokenExpiry
    });

    // Calculate expires in seconds
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  private generateVerificationToken(userId: string): string {
    const payload = {
      userId,
      type: 'email_verification',
      timestamp: Date.now()
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '24h'
    });
  }

  private generatePasswordResetToken(userId: string): string {
    const payload = {
      userId,
      type: 'password_reset',
      timestamp: Date.now()
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '1h'
    });
  }

  private generateSessionId(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
