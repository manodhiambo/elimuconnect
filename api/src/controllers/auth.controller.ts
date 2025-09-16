import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import jwt, { Secret, JwtPayload, TokenExpiredError, JsonWebTokenError, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName, school, role, level, grade } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('User with this email already exists', 409);
      }

      const user = new User({
        email,
        password, // Password will be hashed by pre-save middleware
        role: role || 'student',
        verified: false, // Changed from isEmailVerified
        profile: {
          firstName,
          lastName,
          school,
          level: level || 'primary',
          grade: grade || '1'
        }
      });

      await user.save();

      const tokens = this.generateTokens(user.id);

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          role: user.role,
          isEmailVerified: user.verified
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

      // Find user with password included
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if user is active (check last activity manually)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (user.lastActive <= oneWeekAgo) {
        throw new AppError('Account is inactive. Please contact support.', 403);
      }

      // Use the instance method to compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      const tokens = this.generateTokens(user.id, rememberMe);

      // Update last active time
      await User.findByIdAndUpdate(user.id, { lastActive: new Date() });

      logger.info(`User logged in: ${user.email}`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          role: user.role,
          isEmailVerified: user.verified,
          profilePicture: user.profile.avatar
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
      logger.info(`User logged out: ${userId}`);
      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'your-secret-key') as Secret) as any;

      if (decoded.type !== 'email_verification') {
        throw new AppError('Invalid token type', 400);
      }

      await User.findByIdAndUpdate(decoded.userId, { verified: true });

      logger.info(`Email verified for user: ${decoded.userId}`);

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(new AppError('Verification token has expired', 400));
      }
      if (error instanceof JsonWebTokenError) {
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
        return res.json({
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
      }

      const resetToken = this.generatePasswordResetToken(user.id);

      logger.info(`Password reset requested for: ${email}`);

      res.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      const decoded = jwt.verify(token, (process.env.JWT_SECRET || 'your-secret-key') as Secret) as any;

      if (decoded.type !== 'password_reset') {
        throw new AppError('Invalid token type', 400);
      }

      // Password will be hashed by pre-save middleware
      await User.findByIdAndUpdate(decoded.userId, { password: newPassword });

      logger.info(`Password reset completed for user: ${decoded.userId}`);

      res.json({ message: 'Password reset successful. Please log in with your new password.' });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(new AppError('Reset token has expired', 400));
      }
      if (error instanceof JsonWebTokenError) {
        return next(new AppError('Invalid reset token', 400));
      }
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      const decoded = jwt.verify(refreshToken, (process.env.JWT_REFRESH_SECRET || 'refresh-secret') as Secret) as any;

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError('User not found or inactive', 401);
      }

      // Check if user is active manually
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (user.lastActive <= oneWeekAgo) {
        throw new AppError('User not found or inactive', 401);
      }

      const newTokens = this.generateTokens(user.id);

      res.json({
        message: 'Tokens refreshed successfully',
        tokens: newTokens
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(new AppError('Refresh token has expired', 401));
      }
      if (error instanceof JsonWebTokenError) {
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
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          role: user.role,
          isEmailVerified: user.verified,
          profilePicture: user.profile.avatar,
          school: user.profile.school,
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

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Password will be hashed by pre-save middleware
      user.password = newPassword;
      await user.save();

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

      if (user.verified) {
        throw new AppError('Email is already verified', 400);
      }

      const verificationToken = this.generateVerificationToken(user.id);

      logger.info(`Verification email resent to: ${user.email}`);

      res.json({
        message: 'Verification email sent successfully',
        verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
      });
    } catch (error) {
      next(error);
    }
  };

  // === Helpers ===
  private generateTokens(userId: string, rememberMe: boolean = false) {
    const payload = { userId, sessionId: this.generateSessionId() };

    const accessToken = jwt.sign(
      payload,
      (process.env.JWT_SECRET || 'your-secret-key') as Secret,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' } as SignOptions
    );

    const refreshTokenExpiry = rememberMe ? '30d' : '7d';
    const refreshToken = jwt.sign(
      payload,
      (process.env.JWT_REFRESH_SECRET || 'refresh-secret') as Secret,
      { expiresIn: refreshTokenExpiry } as SignOptions
    );

    const decoded = jwt.decode(accessToken) as JwtPayload;
    const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0;

    return { accessToken, refreshToken, expiresIn };
  }

  private generateVerificationToken(userId: string): string {
    const payload = { userId, type: 'email_verification', timestamp: Date.now() };

    return jwt.sign(
      payload,
      (process.env.JWT_SECRET || 'your-secret-key') as Secret,
      { expiresIn: '24h' } as SignOptions
    );
  }

  private generatePasswordResetToken(userId: string): string {
    const payload = { userId, type: 'password_reset', timestamp: Date.now() };

    return jwt.sign(
      payload,
      (process.env.JWT_SECRET || 'your-secret-key') as Secret,
      { expiresIn: '1h' } as SignOptions
    );
  }

  private generateSessionId(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
