// api/src/models/Discussion.ts
import { Schema, model, Document, Types } from 'mongoose';
import { Discussion as IDiscussion, Reply as IReply } from '@elimuconnect/shared/types';

// Base interfaces
export interface ReplyDocument extends Omit<IReply, '_id'>, Document {
  _id: Types.ObjectId;
}

export interface DiscussionDocument extends Omit<IDiscussion, '_id'>, Document {
  _id: Types.ObjectId;
}

// Reply Schema
const replySchema = new Schema<ReplyDocument>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    // Instead of `ref: 'Reply'`, use self-contained embedded replies
    replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
  },
  { timestamps: true }
);

// Discussion Schema
const discussionSchema = new Schema<DiscussionDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [{ type: String }],
    replies: [replySchema], // embed subdocuments instead of dangling refs
  },
  { timestamps: true }
);

// Models
export const Discussion = model<DiscussionDocument>('Discussion', discussionSchema);
export const Reply = model<ReplyDocument>('Reply', replySchema);
