// api/src/models/Message.ts
import { Schema, model, Document } from 'mongoose';
import { Message as IMessage } from '@elimuconnect/shared/types';

export interface MessageDocument extends Document, Omit<IMessage, '_id'> {}

const messageSchema = new Schema<MessageDocument>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'StudyGroup'
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'audio'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ group: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = model<MessageDocument>('Message', messageSchema);
