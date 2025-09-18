"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_LIMITS = exports.FILE_SIZE_LIMITS = exports.NOTIFICATION_TYPES = exports.ACHIEVEMENT_BADGES = exports.SUBJECTS = exports.KENYAN_COUNTIES = exports.EDUCATION_LEVELS = exports.USER_ROLES = void 0;
exports.USER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    PARENT: 'parent'
};
exports.EDUCATION_LEVELS = {
    PRIMARY: 'Primary',
    SECONDARY: 'Secondary',
    BOTH: 'Both'
};
exports.KENYAN_COUNTIES = [
    'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River',
    'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir', 'Mandera',
    'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu',
    'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri',
    'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
    'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet',
    'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok',
    'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga',
    'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay',
    'Migori', 'Kisii', 'Nyamira'
];
exports.SUBJECTS = {
    PRIMARY: [
        'Mathematics',
        'English',
        'Kiswahili',
        'Science',
        'Social Studies',
        'Christian Religious Education',
        'Islamic Religious Education',
        'Hindu Religious Education',
        'Creative Arts'
    ],
    SECONDARY: [
        'Mathematics',
        'English',
        'Kiswahili',
        'Biology',
        'Chemistry',
        'Physics',
        'Geography',
        'History',
        'Business Studies',
        'Agriculture',
        'Computer Studies',
        'Art & Design',
        'Music',
        'German',
        'French',
        'Arabic',
        'Christian Religious Education',
        'Islamic Religious Education',
        'Hindu Religious Education'
    ]
};
exports.ACHIEVEMENT_BADGES = {
    FIRST_LOGIN: 'first_login',
    FIRST_BOOK_READ: 'first_book_read',
    FIRST_QUIZ_COMPLETED: 'first_quiz_completed',
    FIRST_FORUM_POST: 'first_forum_post',
    READING_STREAK_7: 'reading_streak_7',
    READING_STREAK_30: 'reading_streak_30',
    QUIZ_MASTER: 'quiz_master',
    FORUM_CONTRIBUTOR: 'forum_contributor',
    HELPFUL_PEER: 'helpful_peer',
    TOP_STUDENT: 'top_student',
    BOOKWORM: 'bookworm',
    SCHOLAR: 'scholar',
    MENTOR: 'mentor',
    ACHIEVEMENT_HUNTER: 'achievement_hunter'
};
exports.NOTIFICATION_TYPES = {
    MESSAGE: 'message',
    FORUM_REPLY: 'forum_reply',
    QUIZ_ASSIGNED: 'quiz_assigned',
    ASSIGNMENT_DUE: 'assignment_due',
    ACHIEVEMENT_EARNED: 'achievement_earned',
    SYSTEM_UPDATE: 'system_update',
    STUDY_GROUP_INVITE: 'study_group_invite',
    NEW_BOOK_AVAILABLE: 'new_book_available',
    PAPER_UPLOADED: 'paper_uploaded',
    QUIZ_REMINDER: 'quiz_reminder',
    PEER_TUTORING_REQUEST: 'peer_tutoring_request'
};
exports.FILE_SIZE_LIMITS = {
    AVATAR: 2 * 1024 * 1024, // 2MB
    DOCUMENT: 50 * 1024 * 1024, // 50MB
    VIDEO: 500 * 1024 * 1024, // 500MB
    AUDIO: 50 * 1024 * 1024, // 50MB
    BOOK: 100 * 1024 * 1024, // 100MB
    ASSIGNMENT: 20 * 1024 * 1024 // 20MB
};
exports.API_LIMITS = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_TIME: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_REQUESTS_PER_HOUR: 1000,
    MAX_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_QUIZ_ATTEMPTS: 3,
    MAX_STUDY_GROUP_MEMBERS: 50,
    MAX_MESSAGE_LENGTH: 5000,
    MAX_FORUM_POST_LENGTH: 10000
};
exports.default = {
    USER_ROLES: exports.USER_ROLES,
    EDUCATION_LEVELS: exports.EDUCATION_LEVELS,
    KENYAN_COUNTIES: exports.KENYAN_COUNTIES,
    SUBJECTS: exports.SUBJECTS,
    ACHIEVEMENT_BADGES: exports.ACHIEVEMENT_BADGES,
    NOTIFICATION_TYPES: exports.NOTIFICATION_TYPES,
    FILE_SIZE_LIMITS: exports.FILE_SIZE_LIMITS,
    API_LIMITS: exports.API_LIMITS
};
