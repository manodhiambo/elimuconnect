export declare const USER_ROLES: {
    readonly STUDENT: "student";
    readonly TEACHER: "teacher";
    readonly ADMIN: "admin";
    readonly MODERATOR: "moderator";
    readonly PARENT: "parent";
};
export declare const EDUCATION_LEVELS: {
    readonly PRIMARY: "Primary";
    readonly SECONDARY: "Secondary";
    readonly BOTH: "Both";
};
export declare const KENYAN_COUNTIES: readonly ["Nairobi", "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira"];
export declare const SUBJECTS: {
    readonly PRIMARY: readonly ["Mathematics", "English", "Kiswahili", "Science", "Social Studies", "Christian Religious Education", "Islamic Religious Education", "Hindu Religious Education", "Creative Arts"];
    readonly SECONDARY: readonly ["Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics", "Geography", "History", "Business Studies", "Agriculture", "Computer Studies", "Art & Design", "Music", "German", "French", "Arabic", "Christian Religious Education", "Islamic Religious Education", "Hindu Religious Education"];
};
export declare const ACHIEVEMENT_BADGES: {
    readonly FIRST_LOGIN: "first_login";
    readonly FIRST_BOOK_READ: "first_book_read";
    readonly FIRST_QUIZ_COMPLETED: "first_quiz_completed";
    readonly FIRST_FORUM_POST: "first_forum_post";
    readonly READING_STREAK_7: "reading_streak_7";
    readonly READING_STREAK_30: "reading_streak_30";
    readonly QUIZ_MASTER: "quiz_master";
    readonly FORUM_CONTRIBUTOR: "forum_contributor";
    readonly HELPFUL_PEER: "helpful_peer";
    readonly TOP_STUDENT: "top_student";
    readonly BOOKWORM: "bookworm";
    readonly SCHOLAR: "scholar";
    readonly MENTOR: "mentor";
    readonly ACHIEVEMENT_HUNTER: "achievement_hunter";
};
export declare const NOTIFICATION_TYPES: {
    readonly MESSAGE: "message";
    readonly FORUM_REPLY: "forum_reply";
    readonly QUIZ_ASSIGNED: "quiz_assigned";
    readonly ASSIGNMENT_DUE: "assignment_due";
    readonly ACHIEVEMENT_EARNED: "achievement_earned";
    readonly SYSTEM_UPDATE: "system_update";
    readonly STUDY_GROUP_INVITE: "study_group_invite";
    readonly NEW_BOOK_AVAILABLE: "new_book_available";
    readonly PAPER_UPLOADED: "paper_uploaded";
    readonly QUIZ_REMINDER: "quiz_reminder";
    readonly PEER_TUTORING_REQUEST: "peer_tutoring_request";
};
export type NotificationType = keyof typeof NOTIFICATION_TYPES;
export declare const FILE_SIZE_LIMITS: {
    readonly AVATAR: number;
    readonly DOCUMENT: number;
    readonly VIDEO: number;
    readonly AUDIO: number;
    readonly BOOK: number;
    readonly ASSIGNMENT: number;
};
export declare const API_LIMITS: {
    readonly MAX_LOGIN_ATTEMPTS: 5;
    readonly LOGIN_LOCKOUT_TIME: number;
    readonly MAX_REQUESTS_PER_MINUTE: 60;
    readonly MAX_REQUESTS_PER_HOUR: 1000;
    readonly MAX_UPLOAD_SIZE: number;
    readonly MAX_QUIZ_ATTEMPTS: 3;
    readonly MAX_STUDY_GROUP_MEMBERS: 50;
    readonly MAX_MESSAGE_LENGTH: 5000;
    readonly MAX_FORUM_POST_LENGTH: 10000;
};
declare const _default: {
    USER_ROLES: {
        readonly STUDENT: "student";
        readonly TEACHER: "teacher";
        readonly ADMIN: "admin";
        readonly MODERATOR: "moderator";
        readonly PARENT: "parent";
    };
    EDUCATION_LEVELS: {
        readonly PRIMARY: "Primary";
        readonly SECONDARY: "Secondary";
        readonly BOTH: "Both";
    };
    KENYAN_COUNTIES: readonly ["Nairobi", "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira"];
    SUBJECTS: {
        readonly PRIMARY: readonly ["Mathematics", "English", "Kiswahili", "Science", "Social Studies", "Christian Religious Education", "Islamic Religious Education", "Hindu Religious Education", "Creative Arts"];
        readonly SECONDARY: readonly ["Mathematics", "English", "Kiswahili", "Biology", "Chemistry", "Physics", "Geography", "History", "Business Studies", "Agriculture", "Computer Studies", "Art & Design", "Music", "German", "French", "Arabic", "Christian Religious Education", "Islamic Religious Education", "Hindu Religious Education"];
    };
    ACHIEVEMENT_BADGES: {
        readonly FIRST_LOGIN: "first_login";
        readonly FIRST_BOOK_READ: "first_book_read";
        readonly FIRST_QUIZ_COMPLETED: "first_quiz_completed";
        readonly FIRST_FORUM_POST: "first_forum_post";
        readonly READING_STREAK_7: "reading_streak_7";
        readonly READING_STREAK_30: "reading_streak_30";
        readonly QUIZ_MASTER: "quiz_master";
        readonly FORUM_CONTRIBUTOR: "forum_contributor";
        readonly HELPFUL_PEER: "helpful_peer";
        readonly TOP_STUDENT: "top_student";
        readonly BOOKWORM: "bookworm";
        readonly SCHOLAR: "scholar";
        readonly MENTOR: "mentor";
        readonly ACHIEVEMENT_HUNTER: "achievement_hunter";
    };
    NOTIFICATION_TYPES: {
        readonly MESSAGE: "message";
        readonly FORUM_REPLY: "forum_reply";
        readonly QUIZ_ASSIGNED: "quiz_assigned";
        readonly ASSIGNMENT_DUE: "assignment_due";
        readonly ACHIEVEMENT_EARNED: "achievement_earned";
        readonly SYSTEM_UPDATE: "system_update";
        readonly STUDY_GROUP_INVITE: "study_group_invite";
        readonly NEW_BOOK_AVAILABLE: "new_book_available";
        readonly PAPER_UPLOADED: "paper_uploaded";
        readonly QUIZ_REMINDER: "quiz_reminder";
        readonly PEER_TUTORING_REQUEST: "peer_tutoring_request";
    };
    FILE_SIZE_LIMITS: {
        readonly AVATAR: number;
        readonly DOCUMENT: number;
        readonly VIDEO: number;
        readonly AUDIO: number;
        readonly BOOK: number;
        readonly ASSIGNMENT: number;
    };
    API_LIMITS: {
        readonly MAX_LOGIN_ATTEMPTS: 5;
        readonly LOGIN_LOCKOUT_TIME: number;
        readonly MAX_REQUESTS_PER_MINUTE: 60;
        readonly MAX_REQUESTS_PER_HOUR: 1000;
        readonly MAX_UPLOAD_SIZE: number;
        readonly MAX_QUIZ_ATTEMPTS: 3;
        readonly MAX_STUDY_GROUP_MEMBERS: 50;
        readonly MAX_MESSAGE_LENGTH: 5000;
        readonly MAX_FORUM_POST_LENGTH: 10000;
    };
};
export default _default;
