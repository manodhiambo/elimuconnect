import { Schema, model, Document } from 'mongoose';
import { School as SchoolType, SchoolType as SchoolKind, EducationLevel, KenyanCounty } from '@elimuconnect/shared-types';

// Define the interface for MongoDB documents
export interface SchoolDocument extends Document {
  name: string;
  nemisCode: string;
  type?: SchoolKind;
  educationLevels: EducationLevel[];
  county: KenyanCounty;
  district?: string;
  location?: {
    county?: string;
    subcounty?: string;
    ward?: string;
    address?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  createdBy?: string;
  isVerified: boolean;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<SchoolDocument>(
  {
    name: { type: String, required: true },
    nemisCode: { type: String, required: true, unique: true },
    type: { type: String, enum: ['public', 'private', 'community', 'faith-based', 'special-needs', 'boarding', 'day', 'mixed'] },
    educationLevels: {
      type: [String],
      enum: ['pre-primary', 'primary', 'secondary', 'tertiary', 'university', 'college', 'tvet'],
      required: true,
    },
    county: { type: String, required: true },
    district: { type: String },
    location: {
      county: String,
      subcounty: String,
      ward: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String,
      address: String,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    memberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SchoolModel = model<SchoolDocument>('School', SchoolSchema);
