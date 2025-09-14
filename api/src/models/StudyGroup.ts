// api/src/models/StudyGroup.ts
import { Schema, model, Document } from 'mongoose';
import { StudyGroup as IStudyGroup, EducationLevel } from '@elimuconnect/shared/types';

export interface StudyGroupDocument extends Document, Omit<IStudyGroup, '_id'> {}

const studyGroupSchema = new Schema<StudyGroupDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
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
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxMembers: {
    type: Number,
    default: 50,
    max: 100
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  rules: [{ type: String }],
  resources: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }]
}, {
  timestamps: true
});

// Indexes
studyGroupSchema.index({ subject: 1, level: 1, grade: 1 });
studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ members: 1 });
studyGroupSchema.index({ inviteCode: 1 });

export const StudyGroup = model<StudyGroupDocument>('StudyGroup', studyGroupSchema);
