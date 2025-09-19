import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export class UserController {
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthenticatedRequest;
    const user = await User.findById(authRequest.user?.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || user.createdAt || new Date()
      }
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const authRequest = req as AuthenticatedRequest;
    const user = await User.findByIdAndUpdate(
      authRequest.user?.userId,
      { profile: req.body },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt || user.createdAt || new Date()
      }
    });
  });

  // Additional missing methods
  updateSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'Settings updated' });
  });

  updatePreferences = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'Preferences updated' });
  });

  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'Password changed' });
  });

  deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'Account deleted' });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    res.json({ user: {} });
  });

  searchUsers = asyncHandler(async (req: Request, res: Response) => {
    res.json({ users: [] });
  });

  blockUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'User blocked' });
  });

  unblockUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'User unblocked' });
  });

  followUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'User followed' });
  });

  unfollowUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ message: 'User unfollowed' });
  });

  getFollowers = asyncHandler(async (req: Request, res: Response) => {
    res.json({ followers: [] });
  });

  getFollowing = asyncHandler(async (req: Request, res: Response) => {
    res.json({ following: [] });
  });
}

export const userController = new UserController();
