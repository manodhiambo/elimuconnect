import { z } from 'zod';

// Discussion search schema
export const discussionSearchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  category: z.string().min(1).max(50).optional(),
  tag: z.string().min(1).max(30).optional(),
  subject: z.string().min(1).max(50).optional(),
  sort: z.enum(['recent', 'popular', 'oldest', 'most_replies', 'most_likes', 'relevance']).default('recent'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(['discussion', 'question', 'announcement', 'poll']).optional(),
  status: z.enum(['open', 'closed', 'solved', 'unsolved']).optional()
});

// Create discussion schema
export const createDiscussionSchema = z.object({
  title: z.string().min(5).max(200).trim(),
  content: z.string().min(10).max(10000).trim(),
  category: z.string().min(1).max(50).trim().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  subject: z.string().min(1).max(50).trim().optional(),
  type: z.enum(['discussion', 'question', 'announcement', 'poll']).default('discussion'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  isAnonymous: z.boolean().default(false),
  allowReplies: z.boolean().default(true),
  schoolId: z.string().min(1).optional(),
  studyGroupId: z.string().min(1).optional()
});

// Update discussion schema
export const updateDiscussionSchema = z.object({
  title: z.string().min(5).max(200).trim().optional(),
  content: z.string().min(10).max(10000).trim().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  allowReplies: z.boolean().optional()
});

// Create reply schema
export const createReplySchema = z.object({
  content: z.string().min(1).max(5000).trim(),
  parentReplyId: z.string().min(1).optional(),
  isAnonymous: z.boolean().default(false),
  mentionedUsers: z.array(z.string().min(1)).max(20).optional()
});

// Update reply schema
export const updateReplySchema = z.object({
  content: z.string().min(1).max(5000).trim(),
  mentionedUsers: z.array(z.string().min(1)).max(20).optional()
});

// Report schema
export const reportSchema = z.object({
  reason: z.enum(['spam', 'inappropriate', 'harassment', 'misinformation', 'copyright', 'other']),
  description: z.string().max(500).trim().optional()
});

// Poll creation schema
export const createPollSchema = z.object({
  question: z.string().min(5).max(200).trim(),
  options: z.array(z.string().min(1).max(100)).min(2).max(10),
  allowMultiple: z.boolean().default(false),
  expiresAt: z.string().datetime().optional().refine((date) => {
    if (date) {
      return new Date(date) > new Date();
    }
    return true;
  }, "Expiration date must be in the future"),
  isAnonymous: z.boolean().default(false)
});

// Poll vote schema
export const votePollSchema = z.object({
  optionIds: z.array(z.number().int().positive()).min(1).max(10)
});

// Moderation action schema
export const moderationActionSchema = z.object({
  reason: z.string().max(500).trim().optional(),
  duration: z.number().int().positive().optional()
});

// Parameter validation schemas
export const discussionIdSchema = z.object({
  discussionId: z.string().min(1)
});

export const replyIdSchema = z.object({
  replyId: z.string().min(1)
});

export const userIdSchema = z.object({
  userId: z.string().min(1)
});

export const categoryIdSchema = z.object({
  categoryId: z.string().min(1)
});

export const tagSchema = z.object({
  tag: z.string().min(1).max(30)
});

export const subjectSchema = z.object({
  subject: z.string().min(1).max(50)
});

export const schoolIdSchema = z.object({
  schoolId: z.string().min(1)
});

export const studyGroupIdSchema = z.object({
  groupId: z.string().min(1)
});

export const pollIdSchema = z.object({
  pollId: z.string().min(1)
});

export const notificationIdSchema = z.object({
  notificationId: z.string().min(1)
});
