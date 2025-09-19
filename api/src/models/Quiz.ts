import { Schema, model, Document } from 'mongoose';
import { EducationLevel, EducationLevelType } from './User';

export interface QuizDocument extends Document {
  title: string;
  subject: string;
  level: EducationLevelType;
  grade: string;
  questions: any[];
  duration: number;
  createdBy: Schema.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<QuizDocument>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  level: { type: String, enum: Object.values(EducationLevel), required: true },
  grade: { type: String, required: true },
  questions: [Schema.Types.Mixed],
  duration: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Quiz = model<QuizDocument>('Quiz', quizSchema);
export { Quiz };
export default Quiz;
