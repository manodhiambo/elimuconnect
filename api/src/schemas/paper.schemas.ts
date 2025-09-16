import { z } from 'zod';

export const createPaperSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  examBoard: z.string().min(1, 'Exam board is required'),
  year: z.number().min(1990).max(new Date().getFullYear() + 1),
  term: z.enum(['1', '2', '3', 'annual']),
  level: z.enum(['primary', 'secondary', 'college', 'university']),
  duration: z.number().min(30).max(480), // minutes
  totalMarks: z.number().min(1).max(1000),
  description: z.string().max(1000).optional(),
  instructions: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional()
});

export const updatePaperSchema = createPaperSchema.partial();

export const paperSearchSchema = z.object({
  query: z.string().optional(),
  subject: z.string().optional(),
  examBoard: z.string().optional(),
  year: z.coerce.number().optional(),
  term: z.enum(['1', '2', '3', 'annual']).optional(),
  level: z.enum(['primary', 'secondary', 'college', 'university']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['newest', 'oldest', 'popular', 'rating', 'difficulty']).default('newest'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

export const paperAttemptSchema = z.object({
  timeLimit: z.number().min(1).optional(), // in minutes
  mode: z.enum(['practice', 'timed', 'exam']).default('practice'),
  showAnswers: z.boolean().default(false),
  shuffleQuestions: z.boolean().default(false)
});

export const paperReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  helpfulness: z.number().min(1).max(5).optional()
});

export const paperCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});
