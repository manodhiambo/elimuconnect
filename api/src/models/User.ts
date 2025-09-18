import { Schema, model, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

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
  level: EducationLevelType;
  grade?: string;
  subjects: string[];
  bio?: string;
}

export interface UserPreferences {
  language: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface UserVerification {
  studentId?: string;
  tscNumber?: string;
  adminCode?: string;
}

export interface UserProgress {
  totalPoints: number;
  badges: string[];
  streakDays: number;
  booksRead: number;
  testsCompleted: number;
}

export interface UserDocument extends Document {
  email: string;
  phone?: string;
  password: string;
  role: UserRoleType;
  verified: boolean;
  isActive: boolean;
  profile: UserProfile;
  preferences: UserPreferences;
  verification?: UserVerification;
  progress?: UserProgress;
  createdAt: Date;
  lastActive?: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    sparse: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.STUDENT
  },
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    avatar: String,
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School'
    },
    level: {
      type: String,
      enum: Object.values(EducationLevel),
      required: true
    },
    grade: String,
    subjects: [String],
    bio: String
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  verification: {
    studentId: String,
    tscNumber: String,
    adminCode: String
  },
  progress: {
    totalPoints: {
      type: Number,
      default: 0
    },
    badges: [String],
    streakDays: {
      type: Number,
      default: 0
    },
    booksRead: {
      type: Number,
      default: 0
    },
    testsCompleted: {
      type: Number,
      default: 0
    }
  },
  lastActive: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Pre-save hook to hash password
userSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email });
};

userSchema.statics.findByRole = function(role: UserRoleType) {
  return this.find({ role });
};

export default model<UserDocument>('User', userSchema);
