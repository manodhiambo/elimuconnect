import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// Enhanced memory store with persistence and cleanup
class EnhancedMemoryStore {
  private hits: Map<string, { count: number; resetTime: number; lastAccess: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, record] of this.hits.entries()) {
      if (now > record.resetTime || (now - record.lastAccess) > 24 * 60 * 60 * 1000) {
        this.hits.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }

  incr(key: string, cb: (err: any, hits?: number, resetTime?: Date) => void) {
    const now = Date.now();
    const record = this.hits.get(key);
    
    if (!record || now > record.resetTime) {
      const resetTime = now + (15 * 60 * 1000); // Default 15 minutes window
      this.hits.set(key, { count: 1, resetTime, lastAccess: now });
      cb(null, 1, new Date(resetTime));
    } else {
      record.count++;
      record.lastAccess = now;
      cb(null, record.count, new Date(record.resetTime));
    }
  }

  decrement(key: string) {
    const record = this.hits.get(key);
    if (record && record.count > 0) {
      record.count--;
      record.lastAccess = Date.now();
    }
  }

  resetKey(key: string) {
    this.hits.delete(key);
  }

  getHits(key: string): number {
    const record = this.hits.get(key);
    return record ? record.count : 0;
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.hits.clear();
  }
}

const store = new EnhancedMemoryStore();

// Custom rate limit message generator
const createRateLimitMessage = (retryAfter: number, context?: string) => ({
  error: 'Rate limit exceeded',
  message: `Too many requests${context ? ` for ${context}` : ''}. Please try again later.`,
  retryAfter: `${Math.ceil(retryAfter / 60)} minutes`,
  retryAfterSeconds: retryAfter,
  code: 'RATE_LIMIT_EXCEEDED'
});

// Custom key generator for rate limiting
const createKeyGenerator = (includeUser: boolean = false) => {
  return (req: Request): string => {
    const baseKey = req.ip;
    const userKey = includeUser && req.user?.id ? req.user.id : '';
    const routeKey = req.route?.path || req.path;
    return `${baseKey}:${userKey}:${routeKey}`;
  };
};

// Skip function for successful requests
const skipSuccessfulRequests = (req: Request, res: Response): boolean => {
  return res.statusCode < 400;
};

// Enhanced error handler
const onLimitReached = (req: Request, res: Response, next: Function) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    route: req.route?.path,
    method: req.method,
    userId: req.user?.id
  });
};

// General API rate limiter
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: createRateLimitMessage(15 * 60, 'general API access'),
  keyGenerator: createKeyGenerator(),
  standardHeaders: true,
  legacyHeaders: false,
  store: store as any,
  onLimitReached
});

// Authentication specific rate limiters
export const rateLimitMiddleware = {
  // Login attempts - strict limiting
  login: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login requests per windowMs
    message: createRateLimitMessage(15 * 60, 'login attempts'),
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: (req: Request) => `login:${req.ip}`,
    onLimitReached: (req: Request) => {
      logger.warn('Login rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email: req.body?.email
      });
    }
  }),

  // Registration attempts
  register: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 registration requests per hour
    message: createRateLimitMessage(60 * 60, 'registration attempts'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: (req: Request) => `register:${req.ip}`,
    onLimitReached
  }),

  // Password reset attempts
  forgotPassword: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: createRateLimitMessage(60 * 60, 'password reset attempts'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: (req: Request) => `forgot:${req.ip}`,
    onLimitReached
  }),

  // Email verification resend
  resendVerification: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 2, // limit each IP to 2 resend requests per 5 minutes
    message: createRateLimitMessage(5 * 60, 'verification email requests'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: (req: Request) => `verify:${req.ip}`,
    onLimitReached
  }),

  // File upload rate limiting
  fileUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 file uploads per hour
    message: createRateLimitMessage(60 * 60, 'file uploads'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Image upload rate limiting
  imageUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 image uploads per hour
    message: createRateLimitMessage(60 * 60, 'image uploads'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Document upload rate limiting
  documentUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // limit each IP to 30 document uploads per hour
    message: createRateLimitMessage(60 * 60, 'document uploads'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Avatar upload rate limiting
  avatarUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 avatar uploads per hour
    message: createRateLimitMessage(60 * 60, 'avatar uploads'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Audio upload rate limiting
  audioUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 audio uploads per hour
    message: createRateLimitMessage(60 * 60, 'audio uploads'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Video upload rate limiting
  videoUpload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 video uploads per hour
    message: createRateLimitMessage(60 * 60, 'video uploads'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Temporary upload rate limiting
  tempUpload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 temp uploads per 15 minutes
    message: createRateLimitMessage(15 * 60, 'temporary uploads'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Search rate limiting
  search: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 search requests per minute
    message: createRateLimitMessage(60, 'search requests'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // API endpoint rate limiting
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 API requests per windowMs
    message: createRateLimitMessage(15 * 60, 'API requests'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: createKeyGenerator(true),
    onLimitReached
  }),

  // Message sending rate limiting
  messageSend: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each user to 10 messages per minute
    message: createRateLimitMessage(60, 'message sending'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: (req: Request) => `message:${req.user?.id || req.ip}`,
    onLimitReached
  }),

  // Discussion post rate limiting
  discussionPost: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each user to 5 posts per 5 minutes
    message: createRateLimitMessage(5 * 60, 'discussion posts'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: (req: Request) => `discussion:${req.user?.id || req.ip}`,
    onLimitReached
  }),

  // Quiz attempt rate limiting
  quizAttempt: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each user to 50 quiz attempts per hour
    message: createRateLimitMessage(60 * 60, 'quiz attempts'),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    keyGenerator: (req: Request) => `quiz:${req.user?.id || req.ip}`,
    onLimitReached
  })
};

// Progressive rate limiting (stricter limits for repeat offenders)
export const progressiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: Request) => {
    // In production, this would check a database for violation history
    const violationHistory = 0; // Placeholder
    
    // Adjust limits based on violation history
    if (violationHistory >= 5) return 10; // Very strict for repeat offenders
    if (violationHistory >= 3) return 50; // Stricter for multiple violations
    if (violationHistory >= 1) return 100; // Slightly stricter for first violation
    return 200; // Normal limit for clean users
  },
  message: (req: Request) => {
    const violationHistory = 0; // Placeholder
    return createRateLimitMessage(
      15 * 60,
      `rate limiting (violation level: ${violationHistory})`
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: store as any,
  keyGenerator: createKeyGenerator(true),
  onLimitReached: (req: Request) => {
    logger.warn('Progressive rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id,
      route: req.route?.path,
      violationHistory: 0 // Would be fetched from database
    });
  }
});

// User-specific rate limiting (requires authentication)
export const createUserRateLimit = (
  windowMs: number,
  max: number,
  message: string,
  context?: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: createRateLimitMessage(windowMs / 1000, context || message),
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    onLimitReached
  });
};

// Dynamic rate limiting based on user role
export const roleBasedRateLimit = (limits: {
  student?: number;
  teacher?: number;
  admin?: number;
  school_admin?: number;
  default?: number;
}) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: (req: Request) => {
      const userRole = req.user?.role || 'default';
      return limits[userRole as keyof typeof limits] || limits.default || 100;
    },
    message: (req: Request) => {
      const userRole = req.user?.role || 'guest';
      return createRateLimitMessage(15 * 60, `${userRole} access`);
    },
    keyGenerator: createKeyGenerator(true),
    standardHeaders: true,
    legacyHeaders: false,
    store: store as any,
    onLimitReached
  });
};

// Bypass rate limiting for specific conditions
export const bypassRateLimit = (
  baseRateLimit: any,
  bypassCondition: (req: Request) => boolean
) => {
  return (req: Request, res: Response, next: Function) => {
    if (bypassCondition(req)) {
      logger.debug('Rate limit bypassed', {
        ip: req.ip,
        userId: req.user?.id,
        route: req.route?.path
      });
      return next();
    }
    
    return baseRateLimit(req, res, next);
  };
};

// Sliding window rate limiter
export const slidingWindowRateLimit = (
  windowMs: number,
  maxRequests: number,
  context?: string
) => {
  const windows = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: Function) => {
    const key = createKeyGenerator(true)(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create request timestamps for this key
    let timestamps = windows.get(key) || [];
    
    // Remove timestamps outside the window
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    if (timestamps.length >= maxRequests) {
      const oldestTimestamp = Math.min(...timestamps);
      const retryAfter = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
      
      res.status(429).json(createRateLimitMessage(retryAfter, context));
      return;
    }
    
    // Add current request timestamp
    timestamps.push(now);
    windows.set(key, timestamps);
    
    next();
  };
};

// IP whitelist/blacklist functionality
export const ipFilterRateLimit = (
  whitelist: string[] = [],
  blacklist: string[] = [],
  baseRateLimit: any
) => {
  return (req: Request, res: Response, next: Function) => {
    const clientIp = req.ip;
    
    // Block blacklisted IPs immediately
    if (blacklist.includes(clientIp)) {
      logger.warn('Blocked request from blacklisted IP', { ip: clientIp });
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address has been blocked'
      });
    }
    
    // Skip rate limiting for whitelisted IPs
    if (whitelist.includes(clientIp)) {
      logger.debug('Whitelisted IP bypassed rate limiting', { ip: clientIp });
      return next();
    }
    
    // Apply normal rate limiting
    return baseRateLimit(req, res, next);
  };
};

// Rate limit analytics and monitoring
export const getRateLimitStats = () => {
  return {
    totalKeys: store['hits']?.size || 0,
    activeConnections: store['hits']?.size || 0,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
};

// Clear rate limit for specific key (admin function)
export const clearRateLimit = (key: string) => {
  store.resetKey(key);
  logger.info('Rate limit cleared for key', { key });
};

// Middleware to add rate limit info to response headers
export const addRateLimitHeaders = (req: Request, res: Response, next: Function) => {
  const key = createKeyGenerator(true)(req);
  const hits = store.getHits(key);
  
  res.set({
    'X-RateLimit-Limit': '1000',
    'X-RateLimit-Remaining': Math.max(0, 1000 - hits).toString(),
    'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString()
  });
  
  next();
};

// Export cleanup function for graceful shutdown
export const cleanupRateLimit = () => {
  store.destroy();
  logger.info('Rate limit store cleanup completed');
};

export default rateLimitMiddleware;
