import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId?: string;
}

export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '1h';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(userId: string, rememberMe: boolean = false): Promise<TokenPair> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const sessionId = this.generateSessionId();
      const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId
      };

      // Generate access token
      const accessToken = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: 'elimuconnect-api',
        audience: 'elimuconnect-client'
      });

      // Generate refresh token with longer expiry if "remember me" is checked
      const refreshTokenExpiry = rememberMe ? '30d' : this.refreshTokenExpiry;
      const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
        expiresIn: refreshTokenExpiry,
        issuer: 'elimuconnect-api',
        audience: 'elimuconnect-client'
      });

      // Calculate expires in seconds
      const decoded = jwt.decode(accessToken) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      logger.debug('Tokens generated successfully', {
        userId,
        sessionId,
        expiresIn,
        rememberMe
      });

      return {
        accessToken,
        refreshToken,
        expiresIn
      };
    } catch (error) {
      logger.error('Token generation failed', error);
      throw new AppError('Token generation failed', 500);
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Password verification failed', error);
      throw new AppError('Password verification failed', 500);
    }
  }

  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Password hashing failed', error);
      throw new AppError('Password hashing failed', 500);
    }
  }

  /**
   * Generate email verification token
   */
  async generateVerificationToken(userId: string): Promise<string> {
    try {
      const payload = {
        userId,
        type: 'email_verification',
        timestamp: Date.now()
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: '24h', // Email verification tokens expire in 24 hours
        issuer: 'elimuconnect-api'
      });

      logger.debug('Email verification token generated', { userId });
      return token;
    } catch (error) {
      logger.error('Email verification token generation failed', error);
      throw new AppError('Token generation failed', 500);
    }
  }

  /**
   * Verify email verification token
   */
  async verifyEmailToken(token: string): Promise<string> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as any;
      
      if (payload.type !== 'email_verification') {
        throw new AppError('Invalid token type', 400);
      }

      logger.debug('Email verification token verified', { userId: payload.userId });
      return payload.userId;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Verification token has expired', 400);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid verification token', 400);
      }
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(userId: string): Promise<string> {
    try {
      const payload = {
        userId,
        type: 'password_reset',
        timestamp: Date.now()
      };

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: '1h', // Password reset tokens expire in 1 hour
        issuer: 'elimuconnect-api'
      });

      logger.debug('Password reset token generated', { userId });
      return token;
    } catch (error) {
      logger.error('Password reset token generation failed', error);
      throw new AppError('Token generation failed', 500);
    }
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as any;
      
      if (payload.type !== 'password_reset') {
        throw new AppError('Invalid token type', 400);
      }

      logger.debug('Password reset token verified', { userId: payload.userId });
      return payload.userId;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Reset token has expired', 400);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid reset token', 400);
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as JWTPayload;
      
      // Check if user still exists and is active
      const user = await User.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(user.id);
      
      logger.debug('Tokens refreshed successfully', { userId: user.id });
      return newTokens;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token has expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      // In production, you would store revoked tokens in a database or Redis
      // For now, we'll just verify the token format
      jwt.verify(refreshToken, this.jwtRefreshSecret);
      
      logger.debug('Refresh token revoked');
      // TODO: Add to blacklist in database/Redis
    } catch (error) {
      logger.warn('Failed to revoke refresh token', error);
      // Don't throw error - revocation should be silent
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      // In production, this would mark all user tokens as revoked in database
      logger.debug('All user tokens revoked', { userId });
      // TODO: Implement token revocation in database
    } catch (error) {
      logger.error('Failed to revoke all user tokens', error);
      throw new AppError('Token revocation failed', 500);
    }
  }

  /**
   * Validate token and get user info
   */
  async validateToken(token: string): Promise<IUser | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JWTPayload;
      
      const user = await User.findById(payload.userId).select('-password');
      if (!user || !user.isActive) {
        return null;
      }

      return user;
    } catch (error) {
      logger.debug('Token validation failed', error);
      return null;
    }
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate verification code (6 digits)
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    requirements: string[];
  } {
    const requirements: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      requirements.push('At least 8 characters long');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one lowercase letter');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      requirements.push('At least one special character');
    }

    return {
      isValid: score >= 5,
      score,
      requirements
    };
  }

  /**
   * Generate API key for external services
   */
  generateApiKey(): string {
    const prefix = 'ek_'; // elimuconnect key
    const randomPart = crypto.randomBytes(24).toString('hex');
    return prefix + randomPart;
  }

  /**
   * Validate API key format
   */
  validateApiKeyFormat(apiKey: string): boolean {
    return /^ek_[a-f0-9]{48}$/.test(apiKey);
  }
}
