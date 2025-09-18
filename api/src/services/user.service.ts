// api/src/services/user.service.ts
import { BaseService } from './base.service';
import { User, UserDocument } from '../models/User';
import { helpers } from '@elimuconnect/shared/utils';
import bcrypt from 'bcryptjs';

export class UserService extends BaseService<UserDocument> {
  constructor() {
    super(User);
  }

  protected getSearchFields(): string[] {
    return ['profile.firstName', 'profile.lastName', 'email'];
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.model.findOne({ email: email.toLowerCase() });
  }

  async findByPhone(phone: string): Promise<UserDocument | null> {
    const formattedPhone = helpers.formatPhone(phone);
    return await this.model.findOne({ phone: formattedPhone });
  }

  async verifyUser(userId: string): Promise<UserDocument | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { verified: true },
      { new: true }
    );
  }

  async updateLastActive(userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { lastActive: new Date() });
  }

  async updatePassword(userId: string, newPassword: string): Promise<UserDocument | null> {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    return await this.model.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );
  }

  async addPoints(userId: string, points: number): Promise<UserDocument | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { 
        $inc: { 
          'progress.totalPoints': points,
          'progress.experience': points 
        }
      },
      { new: true }
    );
  }

  async addBadge(userId: string, badge: string): Promise<UserDocument | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $addToSet: { 'progress.badges': badge } },
      { new: true }
    );
  }

  async updateStreak(userId: string, days: number): Promise<UserDocument | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { 'progress.streakDays': days },
      { new: true }
    );
  }

  async incrementBooksRead(userId: string): Promise<UserDocument | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $inc: { 'progress.booksRead': 1 } },
      { new: true }
    );
  }

  async incrementTestsCompleted(userId: string): Promise<UserDocument | null> {
    return await this.model.findByIdAndUpdate(
      userId,
      { $inc: { 'progress.testsCompleted': 1 } },
      { new: true }
    );
  }

  sanitizeUser(user: UserDocument): Partial<UserDocument> {
    const { password, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
  }

  async getLeaderboard(limit = 10, level?: string, grade?: string): Promise<UserDocument[]> {
    const filter: any = { verified: true };
    
    if (level) filter['profile.level'] = level;
    if (grade) filter['profile.grade'] = grade;

    return await this.model
      .find(filter)
      .sort({ 'progress.totalPoints': -1 })
      .limit(limit)
      .select('-password')
      .populate('profile.school', 'name')
      .exec();
  }
}
