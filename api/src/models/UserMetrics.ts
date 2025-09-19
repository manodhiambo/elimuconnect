import { Schema, model, Document } from 'mongoose';

export interface UserMetricsDocument extends Document {
  userId: Schema.Types.ObjectId;
  metric: string;
  value: number;
  period: string;
  timestamp: Date;
}

const userMetricsSchema = new Schema<UserMetricsDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metric: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default model<UserMetricsDocument>('UserMetrics', userMetricsSchema);
