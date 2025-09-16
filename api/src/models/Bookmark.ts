import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  resourceId: Types.ObjectId;
  resourceType: 'book' | 'paper' | 'discussion' | 'quiz' | 'assignment' | 'note' | 'video' | 'article';
  title: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  tags: string[];
  category?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  isPublic: boolean;
  lastAccessedAt?: Date;
  accessCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resourceId: { type: Schema.Types.ObjectId, required: true },
  resourceType: { 
    type: String, 
    enum: ['book', 'paper', 'discussion', 'quiz', 'assignment', 'note', 'video', 'article'],
    required: true 
  },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 500 },
  url: { type: String },
  thumbnailUrl: { type: String },
  tags: [{ type: String, maxlength: 50 }],
  category: { type: String, maxlength: 100 },
  notes: { type: String, maxlength: 1000 },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isPublic: { type: Boolean, default: false },
  lastAccessedAt: { type: Date },
  accessCount: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
BookmarkSchema.index({ userId: 1, createdAt: -1 });
BookmarkSchema.index({ userId: 1, resourceType: 1 });
BookmarkSchema.index({ userId: 1, category: 1 });
BookmarkSchema.index({ userId: 1, tags: 1 });
BookmarkSchema.index({ resourceId: 1, resourceType: 1 });

// Compound index to prevent duplicate bookmarks
BookmarkSchema.index({ userId: 1, resourceId: 1, resourceType: 1 }, { unique: true });

// Virtual for resource details
BookmarkSchema.virtual('resource', {
  ref: function(this: IBookmark) {
    // Dynamic reference based on resourceType
    const modelMap: { [key: string]: string } = {
      book: 'Book',
      paper: 'PastPaper',
      discussion: 'Discussion',
      quiz: 'Quiz',
      assignment: 'Assignment'
    };
    return modelMap[this.resourceType] || 'Book';
  },
  localField: 'resourceId',
  foreignField: '_id',
  justOne: true
});

// Methods
BookmarkSchema.methods.incrementAccess = function() {
  this.accessCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
export default Bookmark;
