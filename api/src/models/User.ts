import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { User as IUser } from '@elimuconnect/shared/types';

// If UserRole and EducationLevel are type-only, re-declare them for runtime
const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

const EducationLevel = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  UNIVERSITY: 'university',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type EducationLevel = (typeof EducationLevel)[keyof typeof EducationLevel];

// Fields needed to create a user
export interface UserAttrs extends Omit<IUser, '_id'> {
  password: string;
}

// MongoDB document
export interface UserDocument extends Document, UserAttrs {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    profile: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      avatar: { type: String },
      school: { type: Schema.Types.ObjectId, ref: 'School' },
      level: {
        type: String,
        enum: Object.values(EducationLevel),
        required: true,
      },
      grade: { type: String, required: true },
      subjects: [{ type: String }],
      bio: { type: String, maxlength: 500 },
    },
    verification: {
      studentId: { type: String },
      tscNumber: { type: String },
      adminCode: { type: String },
    },
    preferences: {
      language: { type: String, enum: ['en', 'sw'], default: 'en' },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
    progress: {
      totalPoints: { type: Number, default: 0 },
      badges: [{ type: String }],
      streakDays: { type: Number, default: 0 },
      booksRead: { type: Number, default: 0 },
      testsCompleted: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      experience: { type: Number, default: 0 },
    },
    lastActive: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.school': 1 });
userSchema.index({ role: 1 });
userSchema.index({ verified: 1 });

// Virtual fields
userSchema.virtual('fullName').get(function () {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<UserDocument>('User', userSchema);
