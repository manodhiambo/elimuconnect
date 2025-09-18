"use strict";
// Update: /home/manodhiambo/elimuconnect/shared/utils/src/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateUtils = exports.validators = exports.helpers = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
// Logger configuration
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.colorize(), winston_1.default.format.simple()),
    defaultMeta: { service: 'elimuconnect-api' },
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.simple()
    }));
}
// Helper utilities
exports.helpers = {
    formatPhone: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('254')) {
            return `+${cleaned}`;
        }
        else if (cleaned.startsWith('0')) {
            return `+254${cleaned.substring(1)}`;
        }
        else if (cleaned.length === 9) {
            return `+254${cleaned}`;
        }
        return `+${cleaned}`;
    },
    generateCode: (length = 6) => {
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    generateOTP: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    slugify: (text) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },
    capitalizeWords: (text) => {
        return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    },
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    validatePhone: (phone) => {
        const phoneRegex = /^(\+254|0)?[17]\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    sanitizeString: (str) => {
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    },
    truncateText: (text, maxLength) => {
        if (text.length <= maxLength)
            return text;
        return text.substr(0, maxLength) + '...';
    },
    formatFileSize: (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    generateSlug: (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    },
    isValidObjectId: (id) => {
        return /^[0-9a-fA-F]{24}$/.test(id);
    },
    calculateReadingTime: (text) => {
        const wordsPerMinute = 200;
        const wordCount = text.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    },
    generatePassword: (length = 12) => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    },
    delay: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    randomElement: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },
    groupBy: (array, key) => {
        return array.reduce((groups, item) => {
            const group = String(item[key]);
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }
};
// Validation utilities
exports.validators = {
    isValidKenyanPhone: (phone) => {
        const cleaned = phone.replace(/\s/g, '');
        return /^(\+254|0)?[17]\d{8}$/.test(cleaned);
    },
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    isStrongPassword: (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(password);
    },
    isValidNEMISCode: (code) => {
        return /^\d{8}$/.test(code);
    },
    isValidTSCNumber: (tscNumber) => {
        return /^TSC\/\d{4,6}$/.test(tscNumber);
    }
};
// Date utilities
exports.dateUtils = {
    formatDate: (date, format = 'YYYY-MM-DD') => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        switch (format) {
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            default:
                return date.toISOString();
        }
    },
    isToday: (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    diffInDays: (date1, date2) => {
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
};
exports.default = {
    logger: exports.logger,
    helpers: exports.helpers,
    validators: exports.validators,
    dateUtils: exports.dateUtils
};
