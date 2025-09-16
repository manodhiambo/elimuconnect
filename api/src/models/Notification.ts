import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  senderId?: Types.ObjectId;
  type: 'message' | 'discussion_reply' | 'quiz_result' | 'achievement' | 'follow' | 'study_group' | 'book_recommendation' | 'paper_reminder' | 'system' | 'assignment' | 'exam';
  title: string;
  message: string;
  data?: any; // Additional data specific to notification type
  resourceId?: Types.ObjectId; // ID of related resource (book, discussion, etc.)
  resourceType?: 'book' | 'paper' | 'discussion' | 'message' | 'quiz' | 'user' | 'study_group';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string; // URL to navigate when notification is clicked
  imageUrl?: string;
  scheduledFor?: Date; // For scheduled notifications
  expiresAt?: Date; // When notification should be automatically removed
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['message', 'discussion_reply', 'quiz_result', 'achievement', 'follow', 'study_group', 'book_recommendation', 'paper_reminder', 'system', 'assignment', 'exam'],
    required: true 
  },
  title: { type: String, required: true, maxlength: 100 },
  message: { type: String, required: true, maxlength: 500 },
  data: { type: Schema.Types.Mixed },
  resourceId: { type: Schema.Types.ObjectId },
  resourceType: { type: String, enum: ['book', 'paper', 'discussion', 'message', 'quiz', 'user', 'study_group'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  actionUrl: { type: String },
  imageUrl: { type: String },
  scheduledFor: { type: Date },
  expiresAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ scheduledFor: 1 });

// Virtual for sender details
NotificationSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName profilePicture'
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
