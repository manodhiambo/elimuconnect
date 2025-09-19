import { Schema, model, Document } from 'mongoose';

export interface UserActivityDocument extends Document {
  userId: Schema.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: Schema.Types.ObjectId;
  metadata?: any;
  timestamp: Date;
}

const userActivitySchema = new Schema<UserActivityDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: Schema.Types.ObjectId,
  metadata: Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default model<UserActivityDocument>('UserActivity', userActivitySchema);
