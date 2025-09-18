import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  // Register new user
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role, level, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: role || 'student',
      profile: {
        firstName,
        lastName,
        level: level || 'secondary',
        subjects: []
      },
      phone,
      verified: false,
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          verified: user.verified,
          profile: user.profile,
          createdAt: user.createdAt || new Date()
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  });

  // Login user
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user needs to reverify (inactive for more than a week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    if (user.lastActive && user.lastActive <= oneWeekAgo) {
      return res.status(401).json({
        success: false,
        message: 'Account requires reverification due to inactivity',
        requiresVerification: true
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          verified: user.verified,
          profile: user.profile,
          lastActive: user.lastActive
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });
  });

  // Logout user
  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // In a real app, you'd add the token to a blacklist
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  // Refresh token
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        data: { accessToken }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  });

  // Verify account
  verifyAccount = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { verificationCode } = req.body;

    // In a real app, you'd verify the token/code
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    user.verified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Account verified successfully'
    });
  });

  // Forgot password
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // In a real app, send email with reset link
    // await emailService.sendPasswordReset(user.email, resetToken);

    res.json({
      success: true,
      message: 'Password reset instructions sent to email',
      resetToken // Remove in production
    });
  });

  // Reset password
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reset token'
        });
      }

      // Check if user needs reverification
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      if (user.lastActive && user.lastActive <= oneWeekAgo) {
        return res.status(401).json({
          success: false,
          message: 'Account requires reverification',
          requiresVerification: true
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
  });

  // Get current user
  getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user!.userId).populate('profile.school');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          verified: user.verified,
          profile: user.profile,
          preferences: user.preferences,
          progress: user.progress,
          createdAt: user.createdAt || new Date(),
          lastActive: user.lastActive
        }
      }
    });
  });

  // Change password
  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });
}

export default new AuthController();
