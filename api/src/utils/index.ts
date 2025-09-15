// Shared utility functions for ElimuConnect API

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
  return phoneRegex.test(phone);
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const formatResponse = (data: any, message: string = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const formatError = (message: string, statusCode: number = 400) => {
  return {
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
};
