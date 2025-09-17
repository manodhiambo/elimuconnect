// Export all models from a central location
export { default as User, IUser } from './User';
export { default as School, ISchool } from './School';
export { default as Book, IBook } from './Book';
export { default as PastPaper, IPastPaper } from './PastPaper';
export { default as Discussion, IDiscussion } from './Discussion';
export { default as Message, IMessage } from './Message';
export { default as Quiz, IQuiz } from './Quiz';
export { default as StudyGroup, IStudyGroup } from './StudyGroup';
export { default as Progress, IProgress, IReadingProgress, IQuizProgress, IPaperProgress, ISubjectProgress, ILearningGoal, IAchievement, IStudySession } from './Progress';
export { default as Notification, INotification } from './Notification';
export { default as Assignment, IAssignment, IAssignmentSubmission } from './Assignment';
export { default as Bookmark, IBookmark } from './Bookmark';
export { UserActivity, SystemMetrics, UserMetrics, IUserActivity, ISystemMetrics, IUserMetrics } from './Analytics';
export { default as Reply } from './Reply';
export { default as Category } from './Category';
export { default as Tag } from './Tag';
export { default as Poll } from './Poll';
export { default as Vote } from './Vote';
export { default as Follow } from './Follow';
export { default as Report } from './Report';
export { default as Like } from './Like';

// Additional utility exports
export * from './User';
export * from './School';
export * from './Book';
export * from './PastPaper';
export * from './Discussion';
export * from './Message';
export * from './Quiz';
export * from './StudyGroup';
export * from './Progress';
export * from './Notification';
export * from './Assignment';
export * from './Bookmark';
export * from './Analytics';

// Model registry for dynamic model loading
export const ModelRegistry = {
  User,
  School,
  Book,
  PastPaper,
  Discussion,
  Message,
  Quiz,
  StudyGroup,
  Progress,
  Notification,
  Assignment,
  Bookmark,
  UserActivity,
  SystemMetrics,
  UserMetrics,
  Reply,
  Category,
  Tag,
  Poll,
  Vote,
  Follow,
  Report,
  Like
};

// Helper function to get model by name
export const getModel = (modelName: string) => {
  return ModelRegistry[modelName as keyof typeof ModelRegistry];
};

// Database connection helper
import mongoose from 'mongoose';

export const connectModels = async () => {
  // This function can be used to ensure all models are registered
  // and perform any additional model setup if needed
  
  // Set up any global model configurations
  mongoose.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });

  mongoose.set('toObject', {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  });

  // Add any global plugins or middleware here
  mongoose.plugin(require('mongoose-paginate-v2'));
  
  console.log('All models registered and configured');
};

// Export types for better TypeScript support
export type ModelName = keyof typeof ModelRegistry;

export interface ModelInterface {
  User: typeof User;
  School: typeof School;
  Book: typeof Book;
  PastPaper: typeof PastPaper;
  Discussion: typeof Discussion;
  Message: typeof Message;
  Quiz: typeof Quiz;
  StudyGroup: typeof StudyGroup;
  Progress: typeof Progress;
  Notification: typeof Notification;
  Assignment: typeof Assignment;
  Bookmark: typeof Bookmark;
  UserActivity: typeof UserActivity;
  SystemMetrics: typeof SystemMetrics;
  UserMetrics: typeof UserMetrics;
}

// Re-export mongoose types for convenience
export { Document, Schema, Types, Model } from 'mongoose';
