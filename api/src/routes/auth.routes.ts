import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema 
} from '../schemas/auth.schemas';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', 
  rateLimitMiddleware.register,
  validationMiddleware(registerSchema),
  authController.register
);

router.post('/login', 
  rateLimitMiddleware.login,
  validationMiddleware(loginSchema),
  authController.login
);

router.post('/verify-email', 
  validationMiddleware(verifyEmailSchema),
  authController.verifyEmail
);

router.post('/forgot-password', 
  rateLimitMiddleware.forgotPassword,
  validationMiddleware(forgotPasswordSchema),
  authController.forgotPassword
);

router.post('/reset-password', 
  validationMiddleware(resetPasswordSchema),
  authController.resetPassword
);

router.post('/refresh-token', 
  validationMiddleware(refreshTokenSchema),
  authController.refreshToken
);

// Protected routes
router.post('/logout', 
  authMiddleware,
  authController.logout
);

router.get('/me', 
  authMiddleware,
  authController.getCurrentUser
);

router.post('/change-password', 
  authMiddleware,
  validationMiddleware(resetPasswordSchema),
  authController.changePassword
);

router.post('/resend-verification', 
  authMiddleware,
  rateLimitMiddleware.resendVerification,
  authController.resendVerificationEmail
);

export default router;
