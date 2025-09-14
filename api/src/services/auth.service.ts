// api/src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redis } from '../config/redis';
import { User, UserDocument } from '../models/User';
import { AuthTokens, JwtPayload } from '@elimuconnect/shared/types';
import { logger } from '@elimuconnect/shared/utils';

export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET!;
  private readonly jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
  private readonly jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
  private readonly jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn
    });

    // Store refresh token in Redis
    await redis.setex(
      `refresh_token:${user._id}`,
      7 * 24 * 60 * 60, // 7 days in seconds
      refreshToken
    );

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as JwtPayload;
      
      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (storedToken !== refreshToken) {
        return null;
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.verified) {
        return null;
      }

      return await this.generateTokens(user);
    } catch (error) {
      logger.error('Error refreshing tokens:', error);
      return null;
    }
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    await redis.del(`refresh_token:${userId}`);
  }

  async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    const user = new User();
    user.password = hashedPassword;
    return await user.comparePassword(candidatePassword);
  }

  async generateVerificationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store verification token in Redis with 24-hour expiry
    await redis.setex(`email_verification:${token}`, 24 * 60 * 60, userId);
    
    return token;
  }

  async verifyEmailToken(token: string): Promise<string | null> {
    const userId = await redis.get(`email_verification:${token}`);
    if (userId) {
      await redis.del(`email_verification:${token}`);
    }
    return userId;
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store reset token in Redis with 1-hour expiry
    await redis.setex(`password_reset:${token}`, 60 * 60, userId);
    
    return token;
  }

  async verifyPasswordResetToken(token: string): Promise<string | null> {
    const userId = await redis.get(`password_reset:${token}`);
    if (userId) {
      await redis.del(`password_reset:${token}`);
    }
    return userId;
  }
}
