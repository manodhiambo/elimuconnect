// api/src/models/Book.ts
import { Schema, model, Document } from 'mongoose';
import { Book as IBook, EducationLevel } from '@elimuconnect/shared/types';

export interface BookDocument extends Document, Omit<IBook, '_id'> {}

const bookSchema = new Schema<BookDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    sparse: true,
    unique: true
  },
  level: {
    type: String,
    enum: Object.values(EducationLevel),
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  coverImage: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  pages: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'sw'],
    default: 'en'
  },
  tags: [{ type: String }],
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ subject: 1, level: 1, grade: 1 });
bookSchema.index({ verified: 1 });
bookSchema.index({ uploadedBy: 1 });

export const Book = model<BookDocument>('Book', bookSchema);
