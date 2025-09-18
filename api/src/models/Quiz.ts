import { Schema, model, Document } from 'mongoose';
import { EducationLevel, EducationLevelType } from './User';

export interface QuestionDocument extends Document {
  questionText: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface AnswerDocument extends Document {
  questionId: Schema.Types.ObjectId;
  selectedAnswer: string | string[];
  isCorrect: boolean;
  points: number;
}

export interface QuizAttemptDocument extends Document {
  userId: Schema.Types.ObjectId;
  quizId: Schema.Types.ObjectId;
  answers: AnswerDocument[];
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpent: number;
  completedAt: Date;
}

export interface QuizDocument extends Document {
  title: string;
  description?: string;
  subject: string;
  level: EducationLevelType;
  grade: string;
  questions: QuestionDocument[];
  timeLimit?: number;
  passingScore: number;
  totalMarks: number;
  isPublic: boolean;
  createdBy: Schema.Types.ObjectId;
  school?: Schema.Types.ObjectId;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: Schema.Types.ObjectId[];
  createdAt: Date;
}

const questionSchema = new Schema<QuestionDocument>({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    required: true
  },
  options: [String],
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: true
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  marks: {
    type: Number,
    required: true,
    min: 1
  }
});

const answerSchema = new Schema<AnswerDocument>({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  selectedAnswer: {
    type: Schema.Types.Mixed,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  points: {
    type: Number,
    required: true
  }
});

const quizAttemptSchema = new Schema<QuizAttemptDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  timeSpent: Number,
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const quizSchema = new Schema<QuizDocument>({
  title: {
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
  questions: [questionSchema],
  timeLimit: Number,
  passingScore: {
    type: Number,
    default: 50
  },
  totalMarks: {
    type: Number,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School'
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  attempts: [{
    type: Schema.Types.ObjectId,
    ref: 'QuizAttempt'
  }]
}, {
  timestamps: true
});

export const QuizAttempt = model<QuizAttemptDocument>('QuizAttempt', quizAttemptSchema);
export default model<QuizDocument>('Quiz', quizSchema);
