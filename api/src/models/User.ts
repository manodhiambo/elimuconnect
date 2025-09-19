import { Schema, model, Document } from 'mongoose';

// Enum definitions as const objects for runtime use
export const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SCHOOL_ADMIN: 'school_admin'
} as const;

export const EducationLevel = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary'
} as const;

export const NotificationType = {
  MESSAGE: 'message',
  DISCUSSION: 'discussion',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
export type EducationLevelType = typeof EducationLevel[keyof typeof EducationLevel];
export type NotificationTypeType = typeof NotificationType[keyof typeof NotificationType];

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  school?: Schema.Types.ObjectId;
  level?: EducationLevelType;
  grade?: string;
  subjects?: string[];
  bio?: string;
}

export interface UserProgress {
  badges?: string[];
  booksRead?: number;
  testsCompleted?: number;
  points?: number;
}

export interface UserDocument extends Document {
  email: string;
  password: string;
  role: UserRoleType;
  profile: UserProfile;
  progress?: UserProgress;
  isEmailVerified: boolean;
  isActive: boolean;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  getLastActiveDate(): Date;
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.STUDENT },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: String,
    school: { type: Schema.Types.ObjectId, ref: 'School' },
    level: { type: String, enum: Object.values(EducationLevel) },
    grade: String,
    subjects: [String],
    bio: String
  },
  progress: {
    badges: [String],
    booksRead: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastActive: Date
}, {
  timestamps: true
});

userSchema.methods.getLastActiveDate = function(): Date {
  return this.updatedAt || this.createdAt || new Date();
};

export const User = model<UserDocument>('User', userSchema);
