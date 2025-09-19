import { User, UserDocument } from '../models/User';

export class UserService {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await User.findById(id);
  }

  async createUser(userData: any): Promise<UserDocument> {
    if (userData.phone) {
      userData.phone = userData.phone.replace(/\D/g, '');
    }
    
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id: string, updateData: any): Promise<UserDocument | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async addBadge(userId: string, badgeId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { 'progress.badges': badgeId }
    });
  }

  async addPoints(userId: string, points: number): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $inc: { 'progress.points': points }
    });
  }
}

export const userService = new UserService();
