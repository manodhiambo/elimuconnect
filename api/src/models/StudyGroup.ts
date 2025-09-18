import { Schema, model, Document } from 'mongoose';
import { EducationLevel, EducationLevelType } from './User';

export interface StudyGroupDocument extends Document {
  name: string;
  description?: string;
  subject: string;
  level: EducationLevelType;
  grade: string;
  members: Schema.Types.ObjectId[];
  createdBy: Schema.Types.ObjectId;
  moderators: Schema.Types.ObjectId[];
  isPrivate: boolean;
  joinCode?: string;
  maxMembers?: number;
  school?: Schema.Types.ObjectId;
  tags: string[];
  createdAt: Date;
}

const studyGroupSchema = new Schema<StudyGroupDocument>({
  name: {
    type: String,
    required: true
  },
  description: String,
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
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  joinCode: String,
  maxMembers: {
    type: Number,
    default: 50
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School'
  },
  tags: [String]
}, {
  timestamps: true
});

export default model<StudyGroupDocument>('StudyGroup', studyGroupSchema);
