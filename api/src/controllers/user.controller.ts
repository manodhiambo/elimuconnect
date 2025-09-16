import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { NotificationService } from '../services/notification.service';
import { AchievementService } from '../services/achievement.service';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export class UserController {
  private userService: UserService;
  private notificationService: NotificationService;
  private achievementService: AchievementService;

  constructor() {
    this.userService = new UserService();
    this.notificationService = new NotificationService();
    this.achievementService = new AchievementService();
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const user = await this.userService.getFullProfile(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const updateData = req.body;

      const updatedUser = await this.userService.updateProfile(userId, updateData);

      logger.info(`Profile updated for user: ${userId}`);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!file) {
        throw new AppError('No file uploaded', 400);
      }

      const avatarUrl = await this.userService.updateAvatar(userId, file);

      res.json({
        message: 'Avatar uploaded successfully',
        avatarUrl
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      await this.userService.deleteAvatar(userId);

      res.json({ message: 'Avatar deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const settings = await this.userService.getUserSettings(userId);

      res.json({ settings });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const settingsData = req.body;

      const updatedSettings = await this.userService.updateSettings(userId, settingsData);

      res.json({
        message: 'Settings updated successfully',
        settings: updatedSettings
      });
    } catch (error) {
      next(error);
    }
  };

  getPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const preferences = await this.userService.getUserPreferences(userId);

      res.json({ preferences });
    } catch (error) {
      next(error);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const preferencesData = req.body;

      const updatedPreferences = await this.userService.updatePreferences(userId, preferencesData);

      res.json({
        message: 'Preferences updated successfully',
        preferences: updatedPreferences
      });
    } catch (error) {
      next(error);
    }
  };

  getProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const progress = await this.userService.getUserProgress(userId);

      res.json({ progress });
    } catch (error) {
      next(error);
    }
  };

  getAchievements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const achievements = await this.achievementService.getUserAchievements(userId);

      res.json({ achievements });
    } catch (error) {
      next(error);
    }
  };

  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const statistics = await this.userService.getUserStatistics(userId);

      res.json({ statistics });
    } catch (error) {
      next(error);
    }
  };

  followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { userId: targetUserId } = req.params;

      if (userId === targetUserId) {
        throw new AppError('Cannot follow yourself', 400);
      }

      await this.userService.followUser(userId, targetUserId);

      res.json({ message: 'User followed successfully' });
    } catch (error) {
      next(error);
    }
  };

  unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { userId: targetUserId } = req.params;

      await this.userService.unfollowUser(userId, targetUserId);

      res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
      next(error);
    }
  };

  getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      const followers = await this.userService.getFollowers(userId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ followers });
    } catch (error) {
      next(error);
    }
  };

  getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      const following = await this.userService.getFollowing(userId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });

      res.json({ following });
    } catch (error) {
      next(error);
    }
  };

  getUserStudyGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const studyGroups = await this.userService.getUserStudyGroups(userId);

      res.json({ studyGroups });
    } catch (error) {
      next(error);
    }
  };

  joinStudyGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { groupId } = req.params;

      await this.userService.joinStudyGroup(userId, groupId);

      res.json({ message: 'Joined study group successfully' });
    } catch (error) {
      next(error);
    }
  };

  leaveStudyGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { groupId } = req.params;

      await this.userService.leaveStudyGroup(userId, groupId);

      res.json({ message: 'Left study group successfully' });
    } catch (error) {
      next(error);
    }
  };

  getBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20, type } = req.query;

      const bookmarks = await this.userService.getBookmarks(userId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        type: type as string
      });

      res.json({ bookmarks });
    } catch (error) {
      next(error);
    }
  };

  addBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { resourceId, resourceType } = req.body;

      const bookmark = await this.userService.addBookmark(userId, resourceId, resourceType);

      res.json({
        message: 'Bookmark added successfully',
        bookmark
      });
    } catch (error) {
      next(error);
    }
  };

  removeBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { bookmarkId } = req.params;

      await this.userService.removeBookmark(userId, bookmarkId);

      res.json({ message: 'Bookmark removed successfully' });
    } catch (error) {
      next(error);
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const notifications = await this.notificationService.getUserNotifications(userId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        unreadOnly: unreadOnly === 'true'
      });

      res.json({ notifications });
    } catch (error) {
      next(error);
    }
  };

  markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      await this.notificationService.markAsRead(userId, notificationId);

      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      next(error);
    }
  };

  markAllNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      await this.notificationService.markAllAsRead(userId);

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      await this.notificationService.deleteNotification(userId, notificationId);

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { password } = req.body;

      await this.userService.deleteAccount(userId, password);

      logger.info(`Account deleted for user: ${userId}`);

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  deactivateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      await this.userService.deactivateAccount(userId);

      logger.info(`Account deactivated for user: ${userId}`);

      res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
      next(error);
    }
  };

  reactivateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      await this.userService.reactivateAccount(userId);

      logger.info(`Account reactivated for user: ${userId}`);

      res.json({ message: 'Account reactivated successfully' });
    } catch (error) {
      next(error);
    }
  };
}
