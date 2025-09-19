import { Router } from 'express';
import { authMiddleware, requireEmailVerification } from '../middleware/auth';
import { userController } from '../controllers/user.controller';

const router = Router();

// Profile routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// Settings routes
router.put(
  '/settings',
  authMiddleware,
  requireEmailVerification,
  userController.updateSettings
);

router.put(
  '/preferences',
  authMiddleware,
  requireEmailVerification,
  userController.updatePreferences
);

// Security routes
router.put(
  '/change-password',
  authMiddleware,
  requireEmailVerification,
  userController.changePassword
);

router.delete(
  '/account',
  authMiddleware,
  requireEmailVerification,
  userController.deleteAccount
);

// Public user routes
router.get('/user/:id', userController.getUserById);

// Search routes
router.get(
  '/search',
  authMiddleware,
  userController.searchUsers
);

// Social routes
router.post(
  '/users/:id/block',
  authMiddleware,
  requireEmailVerification,
  userController.blockUser
);

router.delete(
  '/users/:id/block',
  authMiddleware,
  requireEmailVerification,
  userController.unblockUser
);

router.post(
  '/users/:id/follow',
  authMiddleware,
  requireEmailVerification,
  userController.followUser
);

router.delete(
  '/users/:id/follow',
  authMiddleware,
  requireEmailVerification,
  userController.unfollowUser
);

router.get('/followers', authMiddleware, userController.getFollowers);

router.get('/following', authMiddleware, userController.getFollowing);

export default router;
