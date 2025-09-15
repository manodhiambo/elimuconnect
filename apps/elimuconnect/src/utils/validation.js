import { VALIDATION, KENYAN_COUNTIES, SUBJECTS } from './constants';

// Email validation
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Kenyan phone number validation
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  if (!VALIDATION.PHONE_REGEX.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid Kenyan phone number' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long` 
    };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one letter and one number' 
    };
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long` 
    };
  }
  
  if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `${fieldName} must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters` 
    };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { 
      isValid: false, 
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }
  
  return { isValid: true };
};

// Student ID validation
export const validateStudentId = (studentId) => {
  if (!studentId || typeof studentId !== 'string') {
    return { isValid: false, error: 'Student ID is required' };
  }
  
  const trimmedId = studentId.trim();
  
  // Basic format validation (alphanumeric, 4-20 characters)
  const idRegex = /^[a-zA-Z0-9]{4,20}$/;
  if (!idRegex.test(trimmedId)) {
    return { 
      isValid: false, 
      error: 'Student ID must be 4-20 characters long and contain only letters and numbers' 
    };
  }
  
  return { isValid: true };
};

// TSC number validation (for teachers)
export const validateTscNumber = (tscNumber) => {
  if (!tscNumber || typeof tscNumber !== 'string') {
    return { isValid: false, error: 'TSC number is required' };
  }
  
  const trimmedTsc = tscNumber.trim();
  
  // TSC number format: typically numeric, 6-10 digits
  const tscRegex = /^\d{6,10}$/;
  if (!tscRegex.test(trimmedTsc)) {
    return { 
      isValid: false, 
      error: 'TSC number must be 6-10 digits long' 
    };
  }
  
  return { isValid: true };
};

// County validation
export const validateCounty = (county) => {
  if (!county || typeof county !== 'string') {
    return { isValid: false, error: 'County is required' };
  }
  
  if (!KENYAN_COUNTIES.includes(county)) {
    return { isValid: false, error: 'Please select a valid Kenyan county' };
  }
  
  return { isValid: true };
};

// Subject validation
export const validateSubject = (subject, level = null) => {
  if (!subject || typeof subject !== 'string') {
    return { isValid: false, error: 'Subject is required' };
  }
  
  let validSubjects = [];
  if (level === 'Primary') {
    validSubjects = SUBJECTS.PRIMARY;
  } else if (level === 'Secondary') {
    validSubjects = SUBJECTS.SECONDARY;
  } else {
    validSubjects = [...SUBJECTS.PRIMARY, ...SUBJECTS.SECONDARY];
  }
  
  if (!validSubjects.includes(subject)) {
    return { isValid: false, error: 'Please select a valid subject' };
  }
  
  return { isValid: true };
};

// Grade validation
export const validateGrade = (grade, level = null) => {
  if (!grade || typeof grade !== 'string') {
    return { isValid: false, error: 'Grade is required' };
  }
  
  const primaryGrades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];
  const secondaryGrades = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  
  let validGrades = [];
  if (level === 'Primary') {
    validGrades = primaryGrades;
  } else if (level === 'Secondary') {
    validGrades = secondaryGrades;
  } else {
    validGrades = [...primaryGrades, ...secondaryGrades];
  }
  
  if (!validGrades.includes(grade)) {
    return { isValid: false, error: 'Please select a valid grade' };
  }
  
  return { isValid: true };
};

// File validation
export const validateFile = (file, allowedTypes = [], maxSize = null) => {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  // Check file size
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { 
      isValid: false, 
      error: `File size must not exceed ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true };
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];
    
    // Required field check
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = rule.message || `${field} is required`;
      isValid = false;
      continue;
    }
    
    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      continue;
    }
    
    // Custom validation function
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    }
    
    // Min length check
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters long`;
      isValid = false;
    }
    
    // Max length check
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
      isValid = false;
    }
    
    // Pattern check
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${field} format is invalid`;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

// Sanitize string input
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Validate discussion title
export const validateDiscussionTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Discussion title is required' };
  }
  
  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < 5) {
    return { isValid: false, error: 'Title must be at least 5 characters long' };
  }
  
  if (trimmedTitle.length > 200) {
    return { isValid: false, error: 'Title must not exceed 200 characters' };
  }
  
  return { isValid: true };
};

// Validate discussion content
export const validateDiscussionContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Discussion content is required' };
  }
  
  const trimmedContent = content.trim();
  
  if (trimmedContent.length < 10) {
    return { isValid: false, error: 'Content must be at least 10 characters long' };
  }
  
  if (trimmedContent.length > 5000) {
    return { isValid: false, error: 'Content must not exceed 5000 characters' };
  }
  
  return { isValid: true };
};

// Validate message content
export const validateMessageContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Message content is required' };
  }
  
  const trimmedContent = content.trim();
  
  if (trimmedContent.length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmedContent.length > 1000) {
    return { isValid: false, error: 'Message must not exceed 1000 characters' };
  }
  
  return { isValid: true };
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateStudentId,
  validateTscNumber,
  validateCounty,
  validateSubject,
  validateGrade,
  validateFile,
  validateForm,
  sanitizeString,
  validateDiscussionTitle,
  validateDiscussionContent,
  validateMessageContent
};
