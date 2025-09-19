import { Schema, model, Document } from 'mongoose';

export interface SystemMetricsDocument extends Document {
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: any;
}

const systemMetricsSchema = new Schema<SystemMetricsDocument>({
  metric: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: Schema.Types.Mixed
});

export default model<SystemMetricsDocument>('SystemMetrics', systemMetricsSchema);
