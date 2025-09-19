import { Schema, model, Document } from 'mongoose';
import { EducationLevel, EducationLevelType } from './User';

export interface StudyGroupDocument extends Document {
  name: string;
  description: string;
  subject: string;
  level: EducationLevelType;
  members: Schema.Types.ObjectId[];
  admin: Schema.Types.ObjectId;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studyGroupSchema = new Schema<StudyGroupDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  level: { type: String, enum: Object.values(EducationLevel), required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPrivate: { type: Boolean, default: false }
}, {
  timestamps: true
});

const StudyGroup = model<StudyGroupDocument>('StudyGroup', studyGroupSchema);
export { StudyGroup };
export default StudyGroup;
