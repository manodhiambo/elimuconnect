// api/src/models/index.ts - Export all models
export { User, UserDocument } from './User';
export { School, SchoolDocument } from './School';
export { Book, BookDocument } from './Book';
export { Discussion, Reply, DiscussionDocument, ReplyDocument } from './Discussion';
export { Message, MessageDocument } from './Message';
export { StudyGroup, StudyGroupDocument } from './StudyGroup';
export { Quiz, Question, QuizAttempt, Answer, QuizDocument, QuestionDocument, QuizAttemptDocument, AnswerDocument } from './Quiz';
export { PastPaper, PastPaperDocument } from './PastPaper';
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  coverImage: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  pages: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'sw'],
    default: 'en'
  },
  tags: [{ type: String }],
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ subject: 1, level: 1, grade: 1 });
bookSchema.index({ verified: 1 });
bookSchema.index({ uploadedBy: 1 });

export const Book = model<BookDocument>('Book', bookSchema);
