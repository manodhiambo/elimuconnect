import CryptoJS from 'crypto-js';

// Configuration for encryption
const ENCRYPTION_CONFIG = {
  algorithm: 'AES',
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
  keySize: 256 / 32, // 256 bits
  ivSize: 128 / 32,  // 128 bits
};

// Generate a random encryption key
export const generateEncryptionKey = () => {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.keySize).toString();
};

// Generate a random IV (Initialization Vector)
export const generateIV = () => {
  return CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.ivSize);
};

// Encrypt text data
export const encryptText = (text, secretKey) => {
  try {
    if (!text || !secretKey) {
      throw new Error('Text and secret key are required for encryption');
    }

    const iv = generateIV();
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: ENCRYPTION_CONFIG.mode,
      padding: ENCRYPTION_CONFIG.padding
    });

    // Combine IV and encrypted data
    const combined = iv.concat(encrypted.ciphertext);
    return combined.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt text data
export const decryptText = (encryptedData, secretKey) => {
  try {
    if (!encryptedData || !secretKey) {
      throw new Error('Encrypted data and secret key are required for decryption');
    }

    const combined = CryptoJS.enc.Base64.parse(encryptedData);
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    
    // Extract IV and ciphertext
    const iv = CryptoJS.lib.WordArray.create(
      combined.words.slice(0, ENCRYPTION_CONFIG.ivSize)
    );
    const ciphertext = CryptoJS.lib.WordArray.create(
      combined.words.slice(ENCRYPTION_CONFIG.ivSize)
    );

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      {
        iv: iv,
        mode: ENCRYPTION_CONFIG.mode,
        padding: ENCRYPTION_CONFIG.padding
      }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Encrypt JSON objects
export const encryptObject = (obj, secretKey) => {
  try {
    const jsonString = JSON.stringify(obj);
    return encryptText(jsonString, secretKey);
  } catch (error) {
    console.error('Object encryption failed:', error);
    throw new Error('Failed to encrypt object');
  }
};

// Decrypt JSON objects
export const decryptObject = (encryptedData, secretKey) => {
  try {
    const decryptedString = decryptText(encryptedData, secretKey);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Object decryption failed:', error);
    throw new Error('Failed to decrypt object');
  }
};

// Hash password with salt
export const hashPassword = (password, salt = null) => {
  try {
    if (!password) {
      throw new Error('Password is required for hashing');
    }

    // Generate salt if not provided
    if (!salt) {
      salt = CryptoJS.lib.WordArray.random(128/8).toString();
    }

    // Hash password with salt using PBKDF2
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });

    return {
      hash: hash.toString(),
      salt: salt
    };
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to hash password');
  }
};

// Verify password against hash
export const verifyPassword = (password, hashedPassword, salt) => {
  try {
    if (!password || !hashedPassword || !salt) {
      throw new Error('Password, hash, and salt are required for verification');
    }

    const { hash } = hashPassword(password, salt);
    return hash === hashedPassword;
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
};

// Generate secure random token
export const generateSecureToken = (length = 32) => {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    console.error('Token generation failed:', error);
    throw new Error('Failed to generate secure token');
  }
};

// Create HMAC signature
export const createHMACSignature = (data, secretKey) => {
  try {
    if (!data || !secretKey) {
      throw new Error('Data and secret key are required for HMAC signature');
    }

    const signature = CryptoJS.HmacSHA256(data, secretKey);
    return signature.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('HMAC signature creation failed:', error);
    throw new Error('Failed to create HMAC signature');
  }
};

// Verify HMAC signature
export const verifyHMACSignature = (data, signature, secretKey) => {
  try {
    if (!data || !signature || !secretKey) {
      throw new Error('Data, signature, and secret key are required for verification');
    }

    const expectedSignature = createHMACSignature(data, secretKey);
    return expectedSignature === signature;
  } catch (error) {
    console.error('HMAC signature verification failed:', error);
    return false;
  }
};

// Encrypt sensitive user data for local storage
export const encryptForStorage = (data, userKey = null) => {
  try {
    // Use user-specific key or fallback to generated key
    const encryptionKey = userKey || getStorageEncryptionKey();
    
    if (typeof data === 'object') {
      return encryptObject(data, encryptionKey);
    } else {
      return encryptText(String(data), encryptionKey);
    }
  } catch (error) {
    console.error('Storage encryption failed:', error);
    // Return original data if encryption fails (fallback)
    return data;
  }
};

// Decrypt sensitive user data from local storage
export const decryptFromStorage = (encryptedData, userKey = null) => {
  try {
    // Use user-specific key or fallback to generated key
    const encryptionKey = userKey || getStorageEncryptionKey();
    
    // Try to decrypt as object first, then as text
    try {
      return decryptObject(encryptedData, encryptionKey);
    } catch {
      return decryptText(encryptedData, encryptionKey);
    }
  } catch (error) {
    console.error('Storage decryption failed:', error);
    // Return original data if decryption fails (fallback)
    return encryptedData;
  }
};

// Get or create storage encryption key
const getStorageEncryptionKey = () => {
  const keyName = 'elimuconnect_storage_key';
  let key = localStorage.getItem(keyName);
  
  if (!key) {
    key = generateEncryptionKey();
    localStorage.setItem(keyName, key);
  }
  
  return key;
};

// Secure data sanitization
export const sanitizeData = (data) => {
  try {
    if (typeof data === 'string') {
      // Remove potentially dangerous characters
      return data.replace(/[<>\"'&]/g, '');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[key] = sanitizeData(data[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  } catch (error) {
    console.error('Data sanitization failed:', error);
    return data;
  }
};

// Generate fingerprint for data integrity
export const generateDataFingerprint = (data) => {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.SHA256(dataString).toString();
  } catch (error) {
    console.error('Fingerprint generation failed:', error);
    throw new Error('Failed to generate data fingerprint');
  }
};

// Verify data integrity using fingerprint
export const verifyDataIntegrity = (data, fingerprint) => {
  try {
    const currentFingerprint = generateDataFingerprint(data);
    return currentFingerprint === fingerprint;
  } catch (error) {
    console.error('Data integrity verification failed:', error);
    return false;
  }
};

// Encrypt study session data
export const encryptStudySession = (sessionData, userId) => {
  try {
    const sessionKey = CryptoJS.SHA256(`study_session_${userId}`).toString();
    return encryptObject(sessionData, sessionKey);
  } catch (error) {
    console.error('Study session encryption failed:', error);
    throw new Error('Failed to encrypt study session');
  }
};

// Decrypt study session data
export const decryptStudySession = (encryptedSession, userId) => {
  try {
    const sessionKey = CryptoJS.SHA256(`study_session_${userId}`).toString();
    return decryptObject(encryptedSession, sessionKey);
  } catch (error) {
    console.error('Study session decryption failed:', error);
    throw new Error('Failed to decrypt study session');
  }
};

// Encrypt quiz answers for secure storage
export const encryptQuizAnswers = (answers, quizId, userId) => {
  try {
    const quizKey = CryptoJS.SHA256(`quiz_${quizId}_${userId}`).toString();
    return encryptObject(answers, quizKey);
  } catch (error) {
    console.error('Quiz answers encryption failed:', error);
    throw new Error('Failed to encrypt quiz answers');
  }
};

// Decrypt quiz answers
export const decryptQuizAnswers = (encryptedAnswers, quizId, userId) => {
  try {
    const quizKey = CryptoJS.SHA256(`quiz_${quizId}_${userId}`).toString();
    return decryptObject(encryptedAnswers, quizKey);
  } catch (error) {
    console.error('Quiz answers decryption failed:', error);
    throw new Error('Failed to decrypt quiz answers');
  }
};

// Secure message encryption for chat
export const encryptMessage = (message, conversationKey) => {
  try {
    if (!message || !conversationKey) {
      throw new Error('Message and conversation key are required');
    }

    const messageData = {
      content: message.content,
      timestamp: message.timestamp || new Date().toISOString(),
      senderId: message.senderId
    };

    return encryptObject(messageData, conversationKey);
  } catch (error) {
    console.error('Message encryption failed:', error);
    throw new Error('Failed to encrypt message');
  }
};

// Decrypt message for chat
export const decryptMessage = (encryptedMessage, conversationKey) => {
  try {
    if (!encryptedMessage || !conversationKey) {
      throw new Error('Encrypted message and conversation key are required');
    }

    return decryptObject(encryptedMessage, conversationKey);
  } catch (error) {
    console.error('Message decryption failed:', error);
    throw new Error('Failed to decrypt message');
  }
};

// Generate conversation encryption key
export const generateConversationKey = (participantIds) => {
  try {
    if (!participantIds || participantIds.length === 0) {
      throw new Error('Participant IDs are required for conversation key generation');
    }

    // Sort participant IDs to ensure consistent key generation
    const sortedIds = [...participantIds].sort();
    const combinedIds = sortedIds.join('_');
    
    return CryptoJS.SHA256(`conversation_${combinedIds}`).toString();
  } catch (error) {
    console.error('Conversation key generation failed:', error);
    throw new Error('Failed to generate conversation key');
  }
};

// Utility function to check if browser supports crypto
export const isCryptoSupported = () => {
  try {
    return !!(window.crypto && window.crypto.getRandomValues);
  } catch (error) {
    return false;
  }
};

// Generate cryptographically secure random bytes
export const getSecureRandomBytes = (length) => {
  try {
    if (!isCryptoSupported()) {
      throw new Error('Crypto API not supported');
    }

    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Secure random bytes generation failed:', error);
    // Fallback to CryptoJS random
    return CryptoJS.lib.WordArray.random(length).toString();
  }
};

// Clear sensitive data from memory (best effort)
export const clearSensitiveData = (obj) => {
  try {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'string') {
            obj[key] = '';
          } else if (typeof obj[key] === 'object') {
            clearSensitiveData(obj[key]);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to clear sensitive data:', error);
  }
};

export default {
  // Core encryption functions
  encryptText,
  decryptText,
  encryptObject,
  decryptObject,
  
  // Password functions
  hashPassword,
  verifyPassword,
  
  // Token and signature functions
  generateSecureToken,
  createHMACSignature,
  verifyHMACSignature,
  
  // Storage functions
  encryptForStorage,
  decryptFromStorage,
  
  // Data integrity functions
  generateDataFingerprint,
  verifyDataIntegrity,
  
  // Application-specific functions
  encryptStudySession,
  decryptStudySession,
  encryptQuizAnswers,
  decryptQuizAnswers,
  encryptMessage,
  decryptMessage,
  generateConversationKey,
  
  // Utility functions
  sanitizeData,
  isCryptoSupported,
  getSecureRandomBytes,
  clearSensitiveData,
  generateEncryptionKey
};
