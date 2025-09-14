// api/src/models/Discussion.ts
import { Schema, model, Document } from 'mongoose';
import { Discussion as IDiscussion, Reply as IReply, EducationLevel } from '@elimuconnect/shared/types';

export interface ReplyDocument extends Document, Omit<IReply, '_id'> {}
export interface DiscussionDocument extends Document, Omit<IDiscussion, '_id'> {}

const replySchema = new Schema<ReplyDocument>({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  accepted: {
    type: Boolean,
    default: false
  },
  replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }]
}, {
  timestamps: true
});

const discussionSchema = new Schema<DiscussionDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
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
