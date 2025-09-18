import winston from 'winston';
export declare const logger: winston.Logger;
export declare const helpers: {
    formatPhone: (phone: string) => string;
    generateCode: (length?: number) => string;
    generateOTP: () => string;
    slugify: (text: string) => string;
    capitalizeWords: (text: string) => string;
    validateEmail: (email: string) => boolean;
    validatePhone: (phone: string) => boolean;
    sanitizeString: (str: string) => string;
    truncateText: (text: string, maxLength: number) => string;
    formatFileSize: (bytes: number) => string;
    generateSlug: (title: string) => string;
    isValidObjectId: (id: string) => boolean;
    calculateReadingTime: (text: string) => number;
    generatePassword: (length?: number) => string;
    delay: (ms: number) => Promise<void>;
    randomElement: <T>(array: T[]) => T;
    groupBy: <T>(array: T[], key: keyof T) => Record<string, T[]>;
};
export declare const validators: {
    isValidKenyanPhone: (phone: string) => boolean;
    isValidEmail: (email: string) => boolean;
    isStrongPassword: (password: string) => boolean;
    isValidNEMISCode: (code: string) => boolean;
    isValidTSCNumber: (tscNumber: string) => boolean;
};
export declare const dateUtils: {
    formatDate: (date: Date, format?: string) => string;
    isToday: (date: Date) => boolean;
    addDays: (date: Date, days: number) => Date;
    diffInDays: (date1: Date, date2: Date) => number;
};
declare const _default: {
    logger: winston.Logger;
    helpers: {
        formatPhone: (phone: string) => string;
        generateCode: (length?: number) => string;
        generateOTP: () => string;
        slugify: (text: string) => string;
        capitalizeWords: (text: string) => string;
        validateEmail: (email: string) => boolean;
        validatePhone: (phone: string) => boolean;
        sanitizeString: (str: string) => string;
        truncateText: (text: string, maxLength: number) => string;
        formatFileSize: (bytes: number) => string;
        generateSlug: (title: string) => string;
        isValidObjectId: (id: string) => boolean;
        calculateReadingTime: (text: string) => number;
        generatePassword: (length?: number) => string;
        delay: (ms: number) => Promise<void>;
        randomElement: <T>(array: T[]) => T;
        groupBy: <T>(array: T[], key: keyof T) => Record<string, T[]>;
    };
    validators: {
        isValidKenyanPhone: (phone: string) => boolean;
        isValidEmail: (email: string) => boolean;
        isStrongPassword: (password: string) => boolean;
        isValidNEMISCode: (code: string) => boolean;
        isValidTSCNumber: (tscNumber: string) => boolean;
    };
    dateUtils: {
        formatDate: (date: Date, format?: string) => string;
        isToday: (date: Date) => boolean;
        addDays: (date: Date, days: number) => Date;
        diffInDays: (date1: Date, date2: Date) => number;
    };
};
export default _default;
