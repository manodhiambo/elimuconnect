// File: shared/constants/src/app.ts

export const APP_NAME = 'ElimuConnect';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Educational platform connecting students, teachers, and resources in Kenya';

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  PARENT: 'parent'
} as const;

export const DISCUSSION_TYPES = {
  GENERAL: 'general',
  QUESTION: 'question',
  ANNOUNCEMENT: 'announcement',
  STUDY_GROUP: 'study_group',
  HOMEWORK_HELP: 'homework_help'
} as const;

export const DISCUSSION_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  LOCKED: 'locked',
  ARCHIVED: 'archived'
} as const;

export const NOTIFICATION_TYPES = {
  NEW_REPLY: 'new_reply',
  MENTION: 'mention',
  LIKE: 'like',
  SOLUTION_ACCEPTED: 'solution_accepted',
  DISCUSSION_CLOSED: 'discussion_closed',
  MODERATOR_ACTION: 'moderator_action'
} as const;

export const POLL_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  EXPIRED: 'expired'
} as const;

export const REPORT_REASONS = {
  SPAM: 'spam',
  INAPPROPRIATE: 'inappropriate',
  HARASSMENT: 'harassment',
  COPYRIGHT: 'copyright',
  OTHER: 'other'
} as const;

export const BADGE_TYPES = {
  HELPER: 'helper',
  CONTRIBUTOR: 'contributor',
  EXPERT: 'expert',
  MODERATOR: 'moderator',
  PIONEER: 'pioneer'
} as const;
