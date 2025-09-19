import { Schema, model, Document } from 'mongoose';

export interface MessageDocument extends Document {
  sender: Schema.Types.ObjectId;
  recipient: Schema.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file';
  attachments?: string[];
  isRead: boolean;
  readAt?: Date;
  conversation?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<MessageDocument>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  attachments: [String],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation'
  }
}, {
  timestamps: true
});

export default model<MessageDocument>('Message', messageSchema);
