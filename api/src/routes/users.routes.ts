import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { 
  updateProfileSchema, 
  updateSettingsSchema,
  updatePreferencesSchema 
} from '../schemas/user.schemas';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', 
  validationMiddleware(updateProfileSchema),
  userController.updateProfile
);

router.post('/profile/avatar', 
  uploadMiddleware.single('avatar'),
  userController.uploadAvatar
);

router.delete('/profile/avatar', userController.deleteAvatar);

// Settings routes
router.get('/settings', userController.getSettings);
router.put('/settings', 
  validationMiddleware(updateSettingsSchema),
  userController.updateSettings
);

// Preferences routes
router.get('/preferences', userController.getPreferences);
router.put('/preferences', 
  validationMiddleware(updatePreferencesSchema),
  userController.updatePreferences
);

// Progress and achievements
router.get('/progress', userController.getProgress);
router.get('/achievements', userController.getAchievements);
router.get('/statistics', userController.getStatistics);

// Follow/Unfollow functionality
router.post('/follow/:userId', userController.followUser);
router.delete('/follow/:userId', userController.unfollowUser);
router.get('/followers', userController.getFollowers);
router.get('/following', userController.getFollowing);

// Study groups
router.get('/study-groups', userController.getUserStudyGroups);
router.post('/study-groups/:groupId/join', userController.joinStudyGroup);
router.delete('/study-groups/:groupId/leave', userController.leaveStudyGroup);

// Bookmarks and favorites
router.get('/bookmarks', userController.getBookmarks);
router.post('/bookmarks', userController.addBookmark);
router.delete('/bookmarks/:bookmarkId', userController.removeBookmark);

// Notifications
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:notificationId/read', userController.markNotificationAsRead);
router.put('/notifications/read-all', userController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', userController.deleteNotification);

// Account management
router.delete('/account', userController.deleteAccount);
router.post('/account/deactivate', userController.deactivateAccount);
router.post('/account/reactivate', userController.reactivateAccount);

export default router;
