import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { emailService } from '../services/email.service';
import { AuthenticatedRequest } from '../types/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      profile: { firstName, lastName },
      role: role || 'student'
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    
    // Update last active
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        updatedAt: user.updatedAt || user.createdAt || new Date()
      }
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token } = req.params;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      await User.findByIdAndUpdate(decoded.userId, { isEmailVerified: true });
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid verification token' });
    }
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ message: 'Reset token sent', resetToken });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { token, newPassword } = req.body;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid reset token' });
    }
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authRequest = req as AuthenticatedRequest;
    const user = await User.findById(authRequest.user?.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        updatedAt: user.updatedAt || user.createdAt || new Date()
      }
    });
  });

  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    res.json({ message: 'Logged out successfully' });
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authRequest = req as AuthenticatedRequest;
    const user = await User.findById(authRequest.user?.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      updatedAt: user.updatedAt || user.createdAt || new Date()
    });
  });

  changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authRequest = req as AuthenticatedRequest;
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(authRequest.user?.userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      res.status(400).json({ message: 'Invalid current password' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    res.json({ message: 'Password changed successfully' });
  });

  resendVerificationEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authRequest = req as AuthenticatedRequest;
    const user = await User.findById(authRequest.user?.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.json({ message: 'Verification email sent', verificationToken });
  });
}

export const authController = new AuthController();
