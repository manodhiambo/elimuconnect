// api/src/models/Quiz.ts
import { Schema, model, Document } from 'mongoose';
import { Quiz as IQuiz, Question as IQuestion, QuizAttempt as IQuizAttempt, Answer as IAnswer, EducationLevel } from '@elimuconnect/shared/types';

export interface QuestionDocument extends Document, Omit<IQuestion, '_id'> {}
export interface QuizDocument extends Document, Omit<IQuiz, '_id'> {}
export interface AnswerDocument extends Document, Omit<IAnswer, '_id'> {}
export interface QuizAttemptDocument extends Document, Omit<IQuizAttempt, '_id'> {}

const questionSchema = new Schema<QuestionDocument>({
  question: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
    required: true
  },
  options: [{ type: String }],
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String,
    maxlength: 500
  },
  marks: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

const quizSchema = new Schema<QuizDocument>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
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
  questions: [questionSchema],
  duration: {
    type: Number,
    required: true,
    min: 5 // minimum 5 minutes
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passingScore: {
    type: Number,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{ type: String }]
}, {
  timestamps: true
});

const answerSchema = new Schema<AnswerDocument>({
  question: {
    type: Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: Schema.Types.Mixed,
    required: true
  },
  correct: {
    type: Boolean,
    required: true
  },
  marks: {
    type: Number,
    required: true
  }
});

const quizAttemptSchema = new Schema<QuizAttemptDocument>({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    required: true // in seconds
  },
  completed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
quizSchema.index({ subject: 1, level: 1, grade: 1 });
quizSchema.index({ creator: 1 });
quizSchema.index({ isPublic: 1 });
quizAttemptSchema.index({ quiz: 1, user: 1 });
quizAttemptSchema.index({ user: 1, completedAt: -1 });

export const Question = model<QuestionDocument>('Question', questionSchema);
export const Quiz = model<QuizDocument>('Quiz', quizSchema);
export const Answer = model<AnswerDocument>('Answer', answerSchema);
export const QuizAttempt = model<QuizAttemptDocument>('QuizAttempt', quizAttemptSchema);
