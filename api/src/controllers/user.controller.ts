import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class UserController {
  // Get current user profile
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          role: user.role,
          verified: user.verified,
          profile: user.profile,
          preferences: user.preferences,
          progress: user.progress,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Update user profile
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const updateData = req.body;

      // Build update object for nested profile
      const profileUpdate: Record<string, any> = {};
      
      // Use string literals instead of computed properties to avoid TypeScript error
      Object.keys(updateData).forEach(key => {
        const profileKey = `profile.${key}`;
        profileUpdate[profileKey] = updateData[key];
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: profileUpdate },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info(`User profile updated: ${userId}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Update user settings
  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { language, theme, notifications } = req.body;

      const updateData: Record<string, any> = {};
      if (language) updateData['preferences.language'] = language;
      if (theme) updateData['preferences.theme'] = theme;
      if (notifications) updateData['preferences.notifications'] = notifications;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info(`User settings updated: ${userId}`);

      res.json({
        success: true,
        message: 'Settings updated successfully',
        preferences: user.preferences
      });
    } catch (error) {
      next(error);
    }
  };

  // Update user preferences
  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const preferenceData = req.body;

      // Build update object for nested preferences
      const preferencesUpdate: Record<string, any> = {};
      
      Object.keys(preferenceData).forEach(key => {
        const value = preferenceData[key];
        if (typeof value === 'object' && value !== null) {
          // Handle nested objects like notifications, privacy, learning
          Object.keys(value).forEach(nestedKey => {
            const prefKey = `preferences.${key}.${nestedKey}`;
            preferencesUpdate[prefKey] = value[nestedKey];
          });
        } else {
          const prefKey = `preferences.${key}`;
          preferencesUpdate[prefKey] = value;
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: preferencesUpdate },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      logger.info(`User preferences updated: ${userId}`);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    } catch (error) {
      next(error);
    }
  };

  // Change password
  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete account
  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password } = req.body;
      const userId = req.user?.id;

      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Password is incorrect', 400);
      }

      await User.findByIdAndDelete(userId);

      logger.warn(`User account deleted: ${userId}`);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user by ID
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select('-password -email -phone -verification');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatar: user.profile.avatar,
          role: user.role,
          school: user.profile.school,
          level: user.profile.level,
          grade: user.profile.grade,
          bio: user.profile.bio,
          progress: user.progress,
          verified: user.verified,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Search users
  searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        query, 
        role, 
        school, 
        level, 
        verified,
        page = 1, 
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter: Record<string, any> = {};
      
      if (query) {
        filter.$or = [
          { 'profile.firstName': { $regex: query, $options: 'i' } },
          { 'profile.lastName': { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ];
      }
      
      if (role) filter.role = role;
      if (school) filter['profile.school'] = school;
      if (level) filter['profile.level'] = level;
      if (verified !== undefined) filter.verified = verified === 'true';

      const sortDirection = sortOrder === 'desc' ? -1 : 1;
      let sortField = String(sortBy);
      
      if (sortField === 'firstName') {
        sortField = 'profile.firstName';
      } else if (sortField === 'lastName') {
        sortField = 'profile.lastName';
      }

      const skip = ((page as number) - 1) * (limit as number);

      // Create sort object - use proper Mongoose sort typing
      const sortObject: { [key: string]: 1 | -1 } = {};
      sortObject[sortField] = sortDirection as 1 | -1;

      const users = await User.find(filter)
        .select('-password -verification -preferences')
        .sort(sortObject)
        .skip(skip)
        .limit(limit as number);

      const total = await User.countDocuments(filter);
      const totalPages = Math.ceil(total / (limit as number));

      res.json({
        success: true,
        users: users.map(user => ({
          id: user.id,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatar: user.profile.avatar,
          role: user.role,
          school: user.profile.school,
          level: user.profile.level,
          verified: user.verified,
          createdAt: user.createdAt
        })),
        pagination: {
          page: page as number,
          limit: limit as number,
          total,
          totalPages,
          hasNextPage: (page as number) < totalPages,
          hasPrevPage: (page as number) > 1
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Block user
  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      const currentUserId = req.user?.id;

      if (userId === currentUserId) {
        throw new AppError('You cannot block yourself', 400);
      }

      // In a real app, you'd have a separate BlockedUsers collection
      // For now, we'll just log the action
      logger.info(`User blocked: ${userId} by ${currentUserId}`, { reason });

      res.json({
        success: true,
        message: 'User blocked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Unblock user
  unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      // In a real app, you'd remove from BlockedUsers collection
      logger.info(`User unblocked: ${userId} by ${currentUserId}`);

      res.json({
        success: true,
        message: 'User unblocked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Follow user
  followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      if (userId === currentUserId) {
        throw new AppError('You cannot follow yourself', 400);
      }

      const userToFollow = await User.findById(userId);
      if (!userToFollow) {
        throw new AppError('User not found', 404);
      }

      // In a real app, you'd have a separate Follows collection
      logger.info(`User followed: ${userId} by ${currentUserId}`);

      res.json({
        success: true,
        message: 'User followed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Unfollow user
  unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      // In a real app, you'd remove from Follows collection
      logger.info(`User unfollowed: ${userId} by ${currentUserId}`);

      res.json({
        success: true,
        message: 'User unfollowed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get followers
  getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      // In a real app, you'd query the Follows collection
      res.json({
        success: true,
        followers: [],
        count: 0
      });
    } catch (error) {
      next(error);
    }
  };

  // Get following
  getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      
      // In a real app, you'd query the Follows collection
      res.json({
        success: true,
        following: [],
        count: 0
      });
    } catch (error) {
      next(error);
    }
  };
}
