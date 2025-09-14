// api/src/middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';
import { ERROR_MESSAGES } from '@elimuconnect/shared/constants';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

export const rateLimiter = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      message: options.message || ERROR_MESSAGES.RATE_LIMIT_EXCEEDED
    },
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    standardHeaders: true,
    legacyHeaders: false
  });
};
