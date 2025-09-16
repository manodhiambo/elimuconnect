import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserActivity extends Document {
  userId: Types.ObjectId;
  sessionId: string;
  activityType: 'login' | 'logout' | 'page_view' | 'resource_access' | 'quiz_attempt' | 'message_sent' | 'discussion_post' | 'file_upload' | 'search' | 'bookmark' | 'custom';
  resourceType?: 'book' | 'paper' | 'discussion' | 'quiz' | 'assignment' | 'user' | 'school';
  resourceId?: Types.ObjectId;
  metadata?: any; // Additional data specific to activity type
  duration?: number; // Time spent in seconds
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface ISystemMetrics extends Document {
  date: Date;
  activeUsers: number;
  newRegistrations: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViews: number;
  resourceDownloads: number;
  quizAttempts: number;
  discussionPosts: number;
  messagesExchanged: number;
  storageUsed: number; // in bytes
  bandwidthUsed: number; // in bytes
  errorCount: number;
  responseTimeAvg: number; // in milliseconds
  peakConcurrentUsers: number;
  mobileUserPercentage: number;
  topSubjects: { subject: string; count: number }[];
  topBooks: { bookId: Types.ObjectId; title: string; accessCount: number }[];
  topPapers: { paperId: Types.ObjectId; title: string; downloadCount: number }[];
}

export interface IUserMetrics extends Document {
  userId: Types.ObjectId;
  date: Date;
  sessionCount: number;
  totalSessionDuration: number; // in seconds
  pageViews: number;
  resourcesAccessed: number;
  quizzesTaken: number;
  averageQuizScore: number;
  discussionPosts: number;
  messagesExchanged: number;
  booksRead: number;
  papersDownloaded: number;
  studyTimeMinutes: number;
  loginCount: number;
  uniqueDaysActive: number;
  achievementsEarned: number;
  pointsEarned: number;
  subjectActivity: { subject: string; timeSpent: number; resourcesAccessed: number }[];
  deviceTypes: { device: string; count: number }[];
  peakActivityHour: number; // 0-23
}

const UserActivitySchema = new Schema<IUserActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  activityType: { 
    type: String, 
    enum: ['login', 'logout', 'page_view', 'resource_access', 'quiz_attempt', 'message_sent', 'discussion_post', 'file_upload', 'search', 'bookmark', 'custom'],
    required: true 
  },
  resourceType: { 
    type: String, 
    enum: ['book', 'paper', 'discussion', 'quiz', 'assignment', 'user', 'school']
  },
  resourceId: { type: Schema.Types.ObjectId },
  metadata: { type: Schema.Types.Mixed },
  duration: { type: Number, min: 0 },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  location: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  }
}, {
  timestamps: false // Using custom timestamp field
});

const SystemMetricsSchema = new Schema<ISystemMetrics>({
  date: { type: Date, required: true, unique: true },
  activeUsers: { type: Number, default: 0 },
  newRegistrations: { type: Number, default: 0 },
  totalSessions: { type: Number, default: 0 },
  averageSessionDuration: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0, min: 0, max: 100 },
  pageViews: { type: Number, default: 0 },
  resourceDownloads: { type: Number, default: 0 },
  quizAttempts: { type: Number, default: 0 },
  discussionPosts: { type: Number, default: 0 },
  messagesExchanged: { type: Number, default: 0 },
  storageUsed: { type: Number, default: 0 },
  bandwidthUsed: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 },
  responseTimeAvg: { type: Number, default: 0 },
  peakConcurrentUsers: { type: Number, default: 0 },
  mobileUserPercentage: { type: Number, default: 0, min: 0, max: 100 },
  topSubjects: [{
    subject: { type: String, required: true },
    count: { type: Number, required: true }
  }],
  topBooks: [{
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    title: { type: String, required: true },
    accessCount: { type: Number, required: true }
  }],
  topPapers: [{
    paperId: { type: Schema.Types.ObjectId, ref: 'PastPaper', required: true },
    title: { type: String, required: true },
    downloadCount: { type: Number, required: true }
  }]
}, {
  timestamps: true
});

const UserMetricsSchema = new Schema<IUserMetrics>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  sessionCount: { type: Number, default: 0 },
  totalSessionDuration: { type: Number, default: 0 },
  pageViews: { type: Number, default: 0 },
  resourcesAccessed: { type: Number, default: 0 },
  quizzesTaken: { type: Number, default: 0 },
  averageQuizScore: { type: Number, default: 0 },
  discussionPosts: { type: Number, default: 0 },
  messagesExchanged: { type: Number, default: 0 },
  booksRead: { type: Number, default: 0 },
  papersDownloaded: { type: Number, default: 0 },
  studyTimeMinutes: { type: Number, default: 0 },
  loginCount: { type: Number, default: 0 },
  uniqueDaysActive: { type: Number, default: 0 },
  achievementsEarned: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  subjectActivity: [{
    subject: { type: String, required: true },
    timeSpent: { type: Number, required: true },
    resourcesAccessed: { type: Number, required: true }
  }],
  deviceTypes: [{
    device: { type: String, required: true },
    count: { type: Number, required: true }
  }],
  peakActivityHour: { type: Number, min: 0, max: 23 }
}, {
  timestamps: true
});

// Indexes for UserActivity
UserActivitySchema.index({ userId: 1, timestamp: -1 });
UserActivitySchema.index({ sessionId: 1 });
UserActivitySchema.index({ activityType: 1, timestamp: -1 });
UserActivitySchema.index({ resourceType: 1, resourceId: 1 });
UserActivitySchema.index({ timestamp: -1 });

// Indexes for SystemMetrics
SystemMetricsSchema.index({ date: -1 });

// Indexes for UserMetrics
UserMetricsSchema.index({ userId: 1, date: -1 });
UserMetricsSchema.index({ date: -1 });

// Compound index to prevent duplicate user metrics per day
UserMetricsSchema.index({ userId: 1, date: 1 }, { unique: true });

// TTL index for UserActivity (keep for 90 days)
UserActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Static methods for UserActivity
UserActivitySchema.statics.logActivity = function(activityData: Partial<IUserActivity>) {
  return this.create({
    timestamp: new Date(),
    ...activityData
  });
};

UserActivitySchema.statics.getUserActivitySummary = function(userId: string, startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        avgDuration: { $avg: '$duration' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static methods for SystemMetrics
SystemMetricsSchema.statics.getMetricsForPeriod = function(startDate: Date, endDate: Date) {
  return this.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
};

SystemMetricsSchema.statics.updateDailyMetrics = async function(date: Date, updates: Partial<ISystemMetrics>) {
  return this.findOneAndUpdate(
    { date },
    { $set: updates },
    { upsert: true, new: true }
  );
};

// Static methods for UserMetrics
UserMetricsSchema.statics.updateUserMetrics = async function(userId: string, date: Date, updates: Partial<IUserMetrics>) {
  return this.findOneAndUpdate(
    { userId: new Types.ObjectId(userId), date },
    { $inc: updates },
    { upsert: true, new: true }
  );
};

UserMetricsSchema.statics.getUserMetricsSummary = function(userId: string, startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: '$sessionCount' },
        totalDuration: { $sum: '$totalSessionDuration' },
        totalPageViews: { $sum: '$pageViews' },
        totalResourcesAccessed: { $sum: '$resourcesAccessed' },
        totalQuizzesTaken: { $sum: '$quizzesTaken' },
        avgQuizScore: { $avg: '$averageQuizScore' },
        totalStudyTime: { $sum: '$studyTimeMinutes' },
        totalPointsEarned: { $sum: '$pointsEarned' }
      }
    }
  ]);
};

export const UserActivity = mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);
export const SystemMetrics = mongoose.model<ISystemMetrics>('SystemMetrics', SystemMetricsSchema);
export const UserMetrics = mongoose.model<IUserMetrics>('UserMetrics', UserMetricsSchema);

export { UserActivitySchema, SystemMetricsSchema, UserMetricsSchema };
