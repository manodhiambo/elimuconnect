import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "fallback-secret";
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  generateAccessToken(payload: any): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.accessTokenExpiry });
  }

  generateRefreshToken(payload: any): string {  
    return jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: this.refreshTokenExpiry });
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.jwtRefreshSecret);
  }

  async createUser(userData: any) {
    const hashedPassword = await this.hashPassword(userData.password);
    return User.create({
      ...userData,
      password: hashedPassword
    });
  }

  async findUserByEmail(email: string) {
    return User.findOne({ email });
  }

  async findUserById(id: string) {
    return User.findById(id);
  }

  async validateUser(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await user.comparePassword(password);
    return isValid ? user : null;
  }

  async updateLastActive(userId: string) {
    return User.findByIdAndUpdate(userId, { lastActive: new Date() });
  }
}

export default new AuthService();
