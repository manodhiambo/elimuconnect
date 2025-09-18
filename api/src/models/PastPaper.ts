import { Schema, model, Document } from 'mongoose';
import { EducationLevel, EducationLevelType } from './User';

export interface PastPaperDocument extends Document {
  title: string;
  subject: string;
  year: number;
  term?: number;
  level: EducationLevelType;
  grade: string;
  examType: string;
  fileUrl: string;
  markingSchemeUrl?: string;
  school?: Schema.Types.ObjectId;
  county?: string;
  uploadedBy: Schema.Types.ObjectId;
  downloads: number;
  verified: boolean;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  duration?: number;
  totalMarks?: number;
  createdAt: Date;
}

const pastPaperSchema = new Schema<PastPaperDocument>({
  title: {
    type: String,
    required: true
  },
  subject: {
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
  level: {
    type: String,
    enum: Object.values(EducationLevel),
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  markingSchemeUrl: String,
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School'
  },
  county: String,
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  duration: Number,
  totalMarks: Number
}, {
  timestamps: true
});

export default model<PastPaperDocument>('PastPaper', pastPaperSchema);
