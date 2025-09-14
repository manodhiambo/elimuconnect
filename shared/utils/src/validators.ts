// shared/utils/src/validators.ts
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string): boolean => {
    // Kenyan phone number validation
    const phoneRegex = /^(\+254|0)(7|1)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  nemisCode: (code: string): boolean => {
    // NEMIS code validation (typically 8 digits)
    const nemisRegex = /^[0-9]{8}$/;
    return nemisRegex.test(code);
  },

  tscNumber: (tsc: string): boolean => {
    // TSC number validation (format: TSC/123456/2020)
    const tscRegex = /^TSC\/[0-9]{6}\/[0-9]{4}$/;
    return tscRegex.test(tsc);
  }
};
