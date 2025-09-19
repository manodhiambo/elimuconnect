import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  async validateUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
  }
}

export const authService = new AuthService();
