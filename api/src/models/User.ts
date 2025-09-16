import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { User, UserRole, EducationLevel } from '@elimuconnect/shared/types';

// User document interface for MongoDB
export interface IUser extends Document {
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  verified: boolean;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    school?: Types.ObjectId;
    level: EducationLevel;
    grade: string;
    subjects?: string[];
    bio?: string;
  };
  verification?: {
    studentId?: string;
    tscNumber?: string;
    adminCode?: string;
  };
  preferences: {
    language: 'en' | 'sw';
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  progress: {
    totalPoints: number;
    badges: string[];
    streakDays: number;
    booksRead: number;
    testsCompleted: number;
    level: number;
    experience: number;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string; // Virtual field
}

const userSchema = new Schema<IUser>(
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
      enum: ['student', 'teacher', 'admin', 'school_admin'],
      required: true,
      default: 'student'
    },
    verified: {
      type: Boolean,
      default: false,
    },
    profile: {
      firstName: { 
        type: String, 
        required: true, 
        trim: true 
      },
      lastName: { 
        type: String, 
        required: true, 
        trim: true 
      },
      avatar: { 
        type: String 
      },
      school: { 
        type: Schema.Types.ObjectId, 
        ref: 'School' 
      },
      level: {
        type: String,
        enum: ['pre-primary', 'primary', 'secondary', 'tertiary', 'university', 'college', 'tvet'],
        required: true,
        default: 'primary'
      },
      grade: { 
        type: String, 
        required: true,
        default: '1'
      },
      subjects: [{ 
        type: String 
      }],
      bio: { 
        type: String, 
        maxlength: 500 
      },
    },
    verification: {
      studentId: { type: String },
      tscNumber: { type: String },
      adminCode: { type: String },
    },
    preferences: {
      language: { 
        type: String, 
        enum: ['en', 'sw'], 
        default: 'en' 
      },
      theme: { 
        type: String, 
        enum: ['light', 'dark'], 
        default: 'light' 
      },
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
    lastActive: { 
      type: Date, 
      default: Date.now 
    },
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.school': 1 });
userSchema.index({ role: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ phone: 1 }, { sparse: true });

// Virtual fields
userSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

userSchema.virtual('initials').get(function (this: IUser) {
  return `${this.profile.firstName.charAt(0)}${this.profile.lastName.charAt(0)}`.toUpperCase();
});

userSchema.virtual('isActive').get(function (this: IUser) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.lastActive > oneWeekAgo;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update lastActive before saving
userSchema.pre('save', function (next) {
  if (this.isNew || this.isModified()) {
    this.lastActive = new Date();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Static methods
userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

userSchema.statics.findVerified = function() {
  return this.find({ verified: true });
};

userSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role });
};

userSchema.statics.findBySchool = function(schoolId: string) {
  return this.find({ 'profile.school': schoolId });
};

// Create and export the model
export const User = model<IUser>('User', userSchema);
export default User;

// Export types for use in other files
export type { UserRole, EducationLevel } from '@elimuconnect/shared/types';
