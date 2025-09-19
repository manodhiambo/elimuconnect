import { Schema, model, Document } from 'mongoose';

export interface BookDocument extends Document {
  title: string;
  author: string;
  isbn?: string;
  subject: string;
  level: string;
  grade: string;
  publisher?: string;
  fileUrl?: string;
  coverImage?: string;
  description?: string;
  totalPages?: number;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<BookDocument>({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  isbn: String,
  subject: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  publisher: String,
  fileUrl: String,
  coverImage: String,
  description: String,
  totalPages: Number,
  downloads: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default model<BookDocument>('Book', bookSchema);
