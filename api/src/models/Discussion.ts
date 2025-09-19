import { Schema, model, Document } from 'mongoose';

export interface DiscussionDocument extends Document {
  title: string;
  content: string;
  author: Schema.Types.ObjectId;
  subject: string;
  tags: string[];
  category: string;
  views: number;
  likes: number;
  replies: number;
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const discussionSchema = new Schema<DiscussionDocument>({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  tags: [String],
  category: {
    type: String,
    default: 'general'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default model<DiscussionDocument>('Discussion', discussionSchema);
