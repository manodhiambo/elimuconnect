"use strict";
// File: shared/constants/src/app.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BADGE_TYPES = exports.REPORT_REASONS = exports.POLL_STATUS = exports.NOTIFICATION_TYPES = exports.DISCUSSION_STATUS = exports.DISCUSSION_TYPES = exports.USER_ROLES = exports.APP_DESCRIPTION = exports.APP_VERSION = exports.APP_NAME = void 0;
exports.APP_NAME = 'ElimuConnect';
exports.APP_VERSION = '1.0.0';
exports.APP_DESCRIPTION = 'Educational platform connecting students, teachers, and resources in Kenya';
exports.USER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    PARENT: 'parent'
};
exports.DISCUSSION_TYPES = {
    GENERAL: 'general',
    QUESTION: 'question',
    ANNOUNCEMENT: 'announcement',
    STUDY_GROUP: 'study_group',
    HOMEWORK_HELP: 'homework_help'
};
exports.DISCUSSION_STATUS = {
    OPEN: 'open',
    CLOSED: 'closed',
    LOCKED: 'locked',
    ARCHIVED: 'archived'
};
exports.NOTIFICATION_TYPES = {
    NEW_REPLY: 'new_reply',
    MENTION: 'mention',
    LIKE: 'like',
    SOLUTION_ACCEPTED: 'solution_accepted',
    DISCUSSION_CLOSED: 'discussion_closed',
    MODERATOR_ACTION: 'moderator_action'
};
exports.POLL_STATUS = {
    ACTIVE: 'active',
    CLOSED: 'closed',
    EXPIRED: 'expired'
};
exports.REPORT_REASONS = {
    SPAM: 'spam',
    INAPPROPRIATE: 'inappropriate',
    HARASSMENT: 'harassment',
    COPYRIGHT: 'copyright',
    OTHER: 'other'
};
exports.BADGE_TYPES = {
    HELPER: 'helper',
    CONTRIBUTOR: 'contributor',
    EXPERT: 'expert',
    MODERATOR: 'moderator',
    PIONEER: 'pioneer'
};
