// api/src/models/PastPaper.ts
import { Schema, model, Document } from 'mongoose';
import { PastPaper as IPastPaper, EducationLevel } from '@elimuconnect/shared/types';

export interface PastPaperDocument extends Document, Omit<IPastPaper, '_id'> {}

const pastPaperSchema = new Schema<PastPaperDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
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
  year: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear()
  },
  term: {
    type: Number,
    min: 1,
    max: 3
  },
  exam: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  markingScheme: {
    type: String
  },
  duration: {
    type: Number,
    required: true,
    min: 30 // minimum 30 minutes
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 1
  },
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
  attempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes
pastPaperSchema.index({ subject: 1, level: 1, grade: 1, year: -1 });
pastPaperSchema.index({ exam: 1 });
pastPaperSchema.index({ uploadedBy: 1 });
pastPaperSchema.index({ verified: 1 });

export const PastPaper = model<PastPaperDocument>('PastPaper', pastPaperSchema);
