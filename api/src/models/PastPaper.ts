import { Schema, model, Document } from 'mongoose';
import { EducationLevel, EducationLevelType } from './User';

export interface PastPaperDocument extends Document {
  title: string;
  subject: string;
  level: EducationLevelType;
  grade: string;
  year: number;
  term?: number;
  school?: Schema.Types.ObjectId;
  fileUrl: string;
  downloadCount: number;
  uploadedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pastPaperSchema = new Schema<PastPaperDocument>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  level: { type: String, enum: Object.values(EducationLevel), required: true },
  grade: { type: String, required: true },
  year: { type: Number, required: true },
  term: Number,
  school: { type: Schema.Types.ObjectId, ref: 'School' },
  fileUrl: { type: String, required: true },
  downloadCount: { type: Number, default: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

const PastPaper = model<PastPaperDocument>('PastPaper', pastPaperSchema);
export { PastPaper };
export default PastPaper;
