import { z } from 'zod';

// Basic fallback schemas
export const userIdSchema = z.object({
  id: z.string()
});

export const discussionIdSchema = z.object({
  id: z.string()
});

export const replyIdSchema = z.object({
  id: z.string()
});

export const categoryIdSchema = z.object({
  id: z.string()
});

export const tagSchema = z.object({
  tag: z.string()
});

export const subjectSchema = z.object({
  subject: z.string()
});

export const studyGroupIdSchema = z.object({
  id: z.string()
});

export const schoolIdSchema = z.object({
  id: z.string()
});

export const notificationIdSchema = z.object({
  id: z.string()
});

export const pollIdSchema = z.object({
  id: z.string()
});
