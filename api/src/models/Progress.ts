import mongoose, { Schema, Document, Types } from 'mongoose';

// Progress Types
export interface IReadingProgress {
  bookId: Types.ObjectId;
  currentPage: number;
  totalPages: number;
  lastReadAt: Date;
  timeSpent: number; // in minutes
  completionPercentage: number;
  notes?: string[];
  bookmarks?: number[]; // page numbers
}

export interface IQuizProgress {
  quizId: Types.ObjectId;
  attempts: number;
  bestScore: number;
  averageScore: number;
  lastAttemptAt: Date;
  timeSpent: number; // in minutes
  correctAnswers: number;
  totalQuestions: number;
  weakAreas: string[]; // subject areas that need improvement
}

export interface IPaperProgress {
  paperId: Types.ObjectId;
  attempts: number;
  bestScore: number;
  averageScore: number;
  lastAttemptAt: Date;
  timeSpent: number; // in minutes
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'submitted';
  submittedAnswers?: any[];
  markedScore?: number;
  feedback?: string;
}

export interface ISubjectProgress {
  subject: string;
  level: string;
  totalStudyTime: number; // in minutes
  booksRead: number;
  booksInProgress: number;
  quizzesCompleted: number;
  papersAttempted: number;
  averageQuizScore: number;
  averagePaperScore: number;
  lastActivityAt: Date;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  weakTopics: string[];
  strongTopics: string[];
}

export interface ILearningGoal {
  id: string;
  title: string;
  description?: string;
  type: 'reading' | 'quiz_score' | 'study_time' | 'paper_completion' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  createdAt: Date;
  completedAt?: Date;
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'performance' | 'social' | 'special';
  icon: string;
  earnedAt: Date;
  points: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteria: any; // The conditions that were met to earn this achievement
}

export interface IStudySession {
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  subject?: string;
  activityType: 'reading' | 'quiz' | 'paper_practice' | 'discussion' | 'research';
  resourceId?: Types.ObjectId;
  resourceType?: 'book' | 'paper' | 'quiz' | 'discussion';
  focusScore?: number; // 1-10 rating of how focused they were
  productivityScore?: number; // 1-10 rating of how productive they felt
  notes?: string;
  breaks?: { startTime: Date; endTime: Date; reason?: string }[];
}

export interface IProgress extends Document {
  userId: Types.ObjectId;
  
  // Overall progress metrics
  totalStudyTime: number; // in minutes
  studyStreak: number; // consecutive days of study
  longestStreak: number;
  lastStudyDate: Date;
  totalPoints: number;
  level: number;
  experiencePoints: number;
  
  // Reading progress
  readingProgress: IReadingProgress[];
  booksCompleted: Types.ObjectId[];
  totalBooksRead: number;
  totalPagesRead: number;
  averageReadingSpeed: number; // pages per hour
  
  // Quiz progress
  quizProgress: IQuizProgress[];
  totalQuizzesCompleted: number;
  averageQuizScore: number;
  quizStreak: number; // consecutive correct answers
  
  // Paper practice progress
  paperProgress: IPaperProgress[];
  totalPapersAttempted: number;
  averagePaperScore: number;
  
  // Subject-wise progress
  subjectProgress: ISubjectProgress[];
  
  // Goals and achievements
  goals: ILearningGoal[];
  achievements: IAchievement[];
  
  // Study sessions
  studySessions: IStudySession[];
  weeklyStudyTime: number;
  monthlyStudyTime: number;
  
  // Analytics data
  studyHeatmap: { date: Date; studyTime: number }[]; // For calendar view
  performanceTrends: { date: Date; subject: string; score: number }[];
  weeklyGoals: { week: Date; targetHours: number; actualHours: number }[];
  
  // Social progress
  forumPosts: number;
  helpfulAnswers: number;
  questionsAsked: number;
  likesReceived: number;
  studyGroupsJoined: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ReadingProgressSchema = new Schema<IReadingProgress>({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  currentPage: { type: Number, default: 0 },
  totalPages: { type: Number, required: true },
  lastReadAt: { type: Date, default: Date.now },
  timeSpent: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  notes: [{ type: String }],
  bookmarks: [{ type: Number }]
});

const QuizProgressSchema = new Schema<IQuizProgress>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  attempts: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lastAttemptAt: { type: Date, default: Date.now },
  timeSpent: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  weakAreas: [{ type: String }]
});

const PaperProgressSchema = new Schema<IPaperProgress>({
  paperId: { type: Schema.Types.ObjectId, ref: 'PastPaper', required: true },
  attempts: { type: Number, default: 0 },
  bestScore: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  lastAttemptAt: { type: Date, default: Date.now },
  timeSpent: { type: Number, default: 0 },
  completionStatus: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'submitted'],
    default: 'not_started'
  },
  submittedAnswers: [{ type: Schema.Types.Mixed }],
  markedScore: { type: Number },
  feedback: { type: String }
});

const SubjectProgressSchema = new Schema<ISubjectProgress>({
  subject: { type: String, required: true },
  level: { type: String, required: true },
  totalStudyTime: { type: Number, default: 0 },
  booksRead: { type: Number, default: 0 },
  booksInProgress: { type: Number, default: 0 },
  quizzesCompleted: { type: Number, default: 0 },
  papersAttempted: { type: Number, default: 0 },
  averageQuizScore: { type: Number, default: 0 },
  averagePaperScore: { type: Number, default: 0 },
  lastActivityAt: { type: Date, default: Date.now },
  masteryLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  weakTopics: [{ type: String }],
  strongTopics: [{ type: String }]
});

const LearningGoalSchema = new Schema<ILearningGoal>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['reading', 'quiz_score', 'study_time', 'paper_completion', 'custom'],
    required: true 
  },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, required: true },
  deadline: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'overdue'],
    default: 'not_started'
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const AchievementSchema = new Schema<IAchievement>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['milestone', 'streak', 'performance', 'social', 'special'],
    required: true 
  },
  icon: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  points: { type: Number, default: 0 },
  level: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  criteria: { type: Schema.Types.Mixed }
});

const StudySessionSchema = new Schema<IStudySession>({
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  subject: { type: String },
  activityType: { 
    type: String, 
    enum: ['reading', 'quiz', 'paper_practice', 'discussion', 'research'],
    required: true 
  },
  resourceId: { type: Schema.Types.ObjectId },
  resourceType: { type: String, enum: ['book', 'paper', 'quiz', 'discussion'] },
  focusScore: { type: Number, min: 1, max: 10 },
  productivityScore: { type: Number, min: 1, max: 10 },
  notes: { type: String },
  breaks: [{
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reason: { type: String }
  }]
});

const ProgressSchema = new Schema<IProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Overall progress metrics
  totalStudyTime: { type: Number, default: 0 },
  studyStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
  totalPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  experiencePoints: { type: Number, default: 0 },
  
  // Reading progress
  readingProgress: [ReadingProgressSchema],
  booksCompleted: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  totalBooksRead: { type: Number, default: 0 },
  totalPagesRead: { type: Number, default: 0 },
  averageReadingSpeed: { type: Number, default: 0 },
  
  // Quiz progress
  quizProgress: [QuizProgressSchema],
  totalQuizzesCompleted: { type: Number, default: 0 },
  averageQuizScore: { type: Number, default: 0 },
  quizStreak: { type: Number, default: 0 },
  
  // Paper practice progress
  paperProgress: [PaperProgressSchema],
  totalPapersAttempted: { type: Number, default: 0 },
  averagePaperScore: { type: Number, default: 0 },
  
  // Subject-wise progress
  subjectProgress: [SubjectProgressSchema],
  
  // Goals and achievements
  goals: [LearningGoalSchema],
  achievements: [AchievementSchema],
  
  // Study sessions
  studySessions: [StudySessionSchema],
  weeklyStudyTime: { type: Number, default: 0 },
  monthlyStudyTime: { type: Number, default: 0 },
  
  // Analytics data
  studyHeatmap: [{
    date: { type: Date, required: true },
    studyTime: { type: Number, required: true }
  }],
  performanceTrends: [{
    date: { type: Date, required: true },
    subject: { type: String, required: true },
    score: { type: Number, required: true }
  }],
  weeklyGoals: [{
    week: { type: Date, required: true },
    targetHours: { type: Number, required: true },
    actualHours: { type: Number, default: 0 }
  }],
  
  // Social progress
  forumPosts: { type: Number, default: 0 },
  helpfulAnswers: { type: Number, default: 0 },
  questionsAsked: { type: Number, default: 0 },
  likesReceived: { type: Number, default: 0 },
  studyGroupsJoined: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ProgressSchema.index({ userId: 1 });
ProgressSchema.index({ 'readingProgress.bookId': 1 });
ProgressSchema.index({ 'quizProgress.quizId': 1 });
ProgressSchema.index({ 'paperProgress.paperId': 1 });
ProgressSchema.index({ lastStudyDate: -1 });
ProgressSchema.index({ totalPoints: -1 });
ProgressSchema.index({ level: -1 });

// Virtual fields
ProgressSchema.virtual('currentLevelProgress').get(function() {
  const pointsForCurrentLevel = this.level * 1000; // 1000 points per level
  const pointsForNextLevel = (this.level + 1) * 1000;
  const progressInCurrentLevel = this.experiencePoints - pointsForCurrentLevel;
  const totalPointsNeededForLevel = pointsForNextLevel - pointsForCurrentLevel;
  
  return {
    current: progressInCurrentLevel,
    total: totalPointsNeededForLevel,
    percentage: Math.min(100, (progressInCurrentLevel / totalPointsNeededForLevel) * 100)
  };
});

ProgressSchema.virtual('completionRates').get(function() {
  const totalBooks = this.readingProgress.length;
  const completedBooks = this.booksCompleted.length;
  const totalQuizzes = this.quizProgress.length;
  const completedQuizzes = this.quizProgress.filter((q: IQuizProgress) => q.attempts > 0).length;
  const totalPapers = this.paperProgress.length;
  const completedPapers = this.paperProgress.filter((p: IPaperProgress) => p.completionStatus === 'completed').length;
  
  return {
    books: totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0,
    quizzes: totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0,
    papers: totalPapers > 0 ? (completedPapers / totalPapers) * 100 : 0
  };
});

// Methods
ProgressSchema.methods.addStudyTime = function(minutes: number, subject?: string) {
  this.totalStudyTime += minutes;
  this.weeklyStudyTime += minutes;
  this.monthlyStudyTime += minutes;
  this.experiencePoints += Math.floor(minutes / 10); // 1 XP per 10 minutes
  
  // Update subject progress if provided
  if (subject) {
    const subjectIndex = this.subjectProgress.findIndex((s: ISubjectProgress) => s.subject === subject);
    if (subjectIndex >= 0) {
      this.subjectProgress[subjectIndex].totalStudyTime += minutes;
      this.subjectProgress[subjectIndex].lastActivityAt = new Date();
    } else {
      this.subjectProgress.push({
        subject,
        level: 'beginner',
        totalStudyTime: minutes,
        lastActivityAt: new Date()
      } as ISubjectProgress);
    }
  }
  
  // Update study streak
  const today = new Date();
  const lastStudy = this.lastStudyDate;
  
  if (!lastStudy || this.isDifferentDay(lastStudy, today)) {
    if (lastStudy && this.isConsecutiveDay(lastStudy, today)) {
      this.studyStreak += 1;
    } else {
      this.studyStreak = 1;
    }
    this.lastStudyDate = today;
  }
  
  if (this.studyStreak > this.longestStreak) {
    this.longestStreak = this.studyStreak;
  }
  
  // Check for level up
  this.checkLevelUp();
};

ProgressSchema.methods.checkLevelUp = function() {
  const requiredXP = this.level * 1000;
  if (this.experiencePoints >= requiredXP) {
    this.level += 1;
    this.totalPoints += 100; // Bonus points for leveling up
    
    // Add level up achievement
    this.achievements.push({
      id: `level_${this.level}`,
      title: `Level ${this.level} Achieved!`,
      description: `You've reached level ${this.level}!`,
      type: 'milestone',
      icon: 'level-up',
      earnedAt: new Date(),
      points: 100,
      level: this.level <= 5 ? 'bronze' : this.level <= 10 ? 'silver' : this.level <= 20 ? 'gold' : 'platinum',
      criteria: { level: this.level }
    } as IAchievement);
  }
};

ProgressSchema.methods.isDifferentDay = function(date1: Date, date2: Date): boolean {
  return date1.toDateString() !== date2.toDateString();
};

ProgressSchema.methods.isConsecutiveDay = function(date1: Date, date2: Date): boolean {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
  return diffDays === 1;
};

ProgressSchema.methods.updateReadingProgress = function(bookId: string, pageData: Partial<IReadingProgress>) {
  const progressIndex = this.readingProgress.findIndex((r: IReadingProgress) => r.bookId.toString() === bookId);
  
  if (progressIndex >= 0) {
    Object.assign(this.readingProgress[progressIndex], pageData);
    this.readingProgress[progressIndex].lastReadAt = new Date();
    this.readingProgress[progressIndex].completionPercentage = 
      (this.readingProgress[progressIndex].currentPage / this.readingProgress[progressIndex].totalPages) * 100;
  } else {
    this.readingProgress.push({
      bookId: new Types.ObjectId(bookId),
      lastReadAt: new Date(),
      completionPercentage: pageData.currentPage && pageData.totalPages ? 
        (pageData.currentPage / pageData.totalPages) * 100 : 0,
      ...pageData
    } as IReadingProgress);
  }
  
  // Check if book is completed
  const progress = this.readingProgress[progressIndex >= 0 ? progressIndex : this.readingProgress.length - 1];
  if (progress.completionPercentage >= 100 && !this.booksCompleted.includes(new Types.ObjectId(bookId))) {
    this.booksCompleted.push(new Types.ObjectId(bookId));
    this.totalBooksRead += 1;
    this.totalPoints += 50; // Bonus points for completing a book
  }
};

export const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);

export default Progress;
