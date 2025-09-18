import { authMiddleware } from "./../middleware";
import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validationMiddleware } from "../middleware/validation.middleware";
import { rateLimitMiddleware } from "../middleware/rateLimit.middleware";
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema 
} from "../schemas/auth.schemas";

const router = Router();
const authController = new AuthController();

/**
 * Async wrapper to handle errors in async route handlers
 * and ensure they match Express's RequestHandler type.
 */
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Public routes
router.post(
  "/register",
  rateLimitMiddleware.register,
  validationMiddleware(registerSchema),
  asyncHandler(authController.register.bind(authController))
);

router.post(
  "/login",
  rateLimitMiddleware.login,
  validationMiddleware(loginSchema),
  asyncHandler(authController.login.bind(authController))
);

router.post(
  "/verify-email",
  validationMiddleware(verifyEmailSchema),
  asyncHandler(authController.verifyEmail.bind(authController))
);

router.post(
  "/forgot-password",
  rateLimitMiddleware.forgotPassword,
  validationMiddleware(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword.bind(authController))
);

router.post(
  "/reset-password",
  validationMiddleware(resetPasswordSchema),
  asyncHandler(authController.resetPassword.bind(authController))
);

router.post(
  "/refresh-token",
  validationMiddleware(refreshTokenSchema),
  asyncHandler(authController.refreshToken.bind(authController))
);

// Protected routes
router.post(
  "/logout",
  authMiddleware,
  asyncHandler(authController.logout.bind(authController))
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(authController.getCurrentUser.bind(authController))
);

router.post(
  "/change-password",
  authMiddleware,
  validationMiddleware(resetPasswordSchema),
  asyncHandler(authController.changePassword.bind(authController))
);

router.post(
  "/resend-verification",
  authMiddleware,
  rateLimitMiddleware.resendVerification,
  asyncHandler(authController.resendVerificationEmail.bind(authController))
);

export default router;
