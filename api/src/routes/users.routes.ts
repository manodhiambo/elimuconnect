import { requireEmailVerification } from "../middleware/auth";
import { authMiddleware } from "./../middleware";
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { 
  updateProfileSchema,
  updateSettingsSchema,
  updatePreferencesSchema,
  userSearchSchema,
  changePasswordSchema,
  deleteAccountSchema,
  blockUserSchema
} from '../schemas/user.schemas';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/profile', 
  userController.getProfile
);

// Update user profile
router.put('/profile',
  requireEmailVerification,
  validationMiddleware(updateProfileSchema),
  userController.updateProfile
);

// Update user settings
router.put('/settings',
  validationMiddleware(updateSettingsSchema),
  userController.updateSettings
);

// Update user preferences
router.put('/preferences',
  validationMiddleware(updatePreferencesSchema),
  userController.updatePreferences
);

// Change password
router.post('/change-password',
  rateLimitMiddleware.api,
  validationMiddleware(changePasswordSchema),
  userController.changePassword
);

// Delete account
router.delete('/account',
  rateLimitMiddleware.api,
  validationMiddleware(deleteAccountSchema),
  userController.deleteAccount
);

// Get user by ID
router.get('/:userId',
  userController.getUserById
);

// Search users
router.get('/',
  validationMiddleware(userSearchSchema, 'query'),
  userController.searchUsers
);

// Block user
router.post('/:userId/block',
  requireEmailVerification,
  validationMiddleware(blockUserSchema),
  userController.blockUser
);

// Unblock user
router.delete('/:userId/block',
  requireEmailVerification,
  userController.unblockUser
);

// Follow user
router.post('/:userId/follow',
  requireEmailVerification,
  userController.followUser
);

// Unfollow user
router.delete('/:userId/follow',
  requireEmailVerification,
  userController.unfollowUser
);

// Get user's followers
router.get('/:userId/followers',
  userController.getFollowers
);

// Get user's following
router.get('/:userId/following',
  userController.getFollowing
);

export default router;
