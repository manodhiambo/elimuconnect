import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  metrics: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  groupBy: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(100)
});

export const progressTrackingSchema = z.object({
  goalId: z.string().uuid(),
  progressValue: z.number().min(0),
  progressType: z.enum(['increment', 'set', 'percentage']).default('increment'),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional()
});

export const customEventSchema = z.object({
  eventName: z.string().min(1, 'Event name is required').max(100),
  eventType: z.enum(['action', 'page_view', 'interaction', 'achievement', 'error']),
  properties: z.record(z.any()).optional(),
  value: z.number().optional(),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime().optional()
});

export const studySessionSchema = z.object({
  subject: z.string().optional(),
  activityType: z.enum(['reading', 'practice', 'quiz', 'discussion', 'research']),
  resourceId: z.string().uuid().optional(),
  resourceType: z.enum(['book', 'paper', 'discussion', 'video', 'note']).optional(),
  plannedDuration: z.number().min(1).optional(), // in minutes
  goals: z.array(z.string()).optional()
});

export const goalTrackingSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['reading', 'study_time', 'quiz_score', 'completion', 'custom']),
  targetValue: z.number().min(0),
  currentValue: z.number().min(0).default(0),
  unit: z.string().max(50).optional(),
  deadline: z.string().datetime().optional(),
  isPublic: z.boolean().default(false),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export const reportGenerationSchema = z.object({
  type: z.enum(['progress', 'performance', 'engagement', 'comprehensive']),
  timeframe: z.enum(['week', 'month', 'quarter', 'year', 'custom']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  includeComparisons: z.boolean().default(false),
  format: z.enum(['json', 'pdf', 'csv', 'excel']).default('json'),
  sections: z.array(z.string()).optional()
});
