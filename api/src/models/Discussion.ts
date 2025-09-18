import { Schema, model, Document } from 'mongoose';
import { Discussion as IDiscussion, Reply as IReply } from '@elimuconnect/shared/types';

export interface ReplyDocument extends Document {
  content: string;
  author: string;
  parentId?: string;
  upvotes: string[];
  downvotes: string[];
}

export interface DiscussionDocument extends Document {
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  subject?: string;
  level?: string;
  pinned: boolean;
  locked: boolean;
  views: number;
  upvotes: string[];
  downvotes: string[];
  replies: ReplyDocument[];
}

const replySchema = new Schema<ReplyDocument>({
  content: { type: String, required: true },
  author: { type: String, required: true },
  parentId: String,
  upvotes: [String],
  downvotes: [String]
}, { timestamps: true });

const discussionSchema = new Schema<DiscussionDocument>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: String,
  tags: [String],
  subject: String,
  level: String,
  pinned: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  upvotes: [String],
  downvotes: [String],
  replies: [replySchema]
}, { timestamps: true });

export const Reply = model<ReplyDocument>('Reply', replySchema);
export const Discussion = model<DiscussionDocument>('Discussion', discussionSchema);
export default model<DiscussionDocument>('Discussion', discussionSchema);
