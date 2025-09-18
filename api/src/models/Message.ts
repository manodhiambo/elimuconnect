import { Schema, model, Document } from 'mongoose';
import { Message as IMessage } from '@elimuconnect/shared/types';

export interface MessageDocument extends Document, Omit<IMessage, '_id'> {}

const messageSchema = new Schema<MessageDocument>({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  subject: String,
  content: { type: String, required: true },
  attachments: [String],
  read: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

export const Message = model<MessageDocument>('Message', messageSchema);
export default model<MessageDocument>('Message', messageSchema);
