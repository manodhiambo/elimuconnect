import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
  type: z.enum(['text', 'image', 'file', 'audio', 'video']).default('text'),
  replyTo: z.string().uuid().optional(),
  mentions: z.array(z.string().uuid()).optional(),
  metadata: z.record(z.any()).optional()
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000, 'Message too long')
});

export const createConversationSchema = z.object({
  type: z.enum(['direct', 'group']).default('direct'),
  participants: z.array(z.string().uuid()).min(1, 'At least one participant is required'),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(false)
});

export const messageSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  conversationId: z.string().uuid().optional(),
  type: z.enum(['text', 'image', 'file', 'audio', 'video']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export const conversationSettingsSchema = z.object({
  notifications: z.boolean().optional(),
  autoDelete: z.boolean().optional(),
  autoDeleteDays: z.number().min(1).max(365).optional(),
  readReceipts: z.boolean().optional(),
  typingIndicators: z.boolean().optional()
});
