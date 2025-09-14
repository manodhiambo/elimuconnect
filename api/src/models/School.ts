// api/src/models/School.ts
import { Schema, model, Document } from 'mongoose';
import { School as ISchool, EducationLevel } from '@elimuconnect/shared/types';

export interface SchoolDocument extends Document, Omit<ISchool, '_id'> {}

const schoolSchema = new Schema<SchoolDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  level: [{
    type: String,
    enum: Object.values(EducationLevel),
    required: true
  }],
  county: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  contact: {
    phone: { type: String },
    email: { type: String, lowercase: true },
    address: { type: String }
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
schoolSchema.index({ code: 1 });
schoolSchema.index({ county: 1 });
schoolSchema.index({ level: 1 });
schoolSchema.index({ verified: 1 });

export const School = model<SchoolDocument>('School', schoolSchema);
