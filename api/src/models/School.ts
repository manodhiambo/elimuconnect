import { Schema, model, Document } from 'mongoose';

export interface SchoolDocument extends Document {
  name: string;
  nemisCode: string;
  type: string;
  level: string;
  educationLevels: string[];
  location: {
    county: string;
    subCounty: string;
    ward: string;
    address?: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<SchoolDocument>({
  name: { type: String, required: true },
  nemisCode: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  level: { type: String, required: true },
  educationLevels: [{ type: String, required: true }],
  location: {
    county: { type: String, required: true },
    subCounty: { type: String, required: true },
    ward: { type: String, required: true },
    address: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const School = model<SchoolDocument>('School', schoolSchema);

export default School;
