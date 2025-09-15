import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch custom event to notify other hooks/components
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch custom event to notify other hooks/components
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    // Listen for custom events from same window/tab
    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('localStorageChange', handleCustomStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('localStorageChange', handleCustomStorageChange);
      }
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
};

// Hook for managing multiple localStorage values with a prefix
export const useLocalStorageState = (prefix = 'elimuconnect') => {
  const [state, setState] = useState({});

  // Load all values with the given prefix
  useEffect(() => {
    const loadPrefixedValues = () => {
      try {
        if (typeof window === 'undefined') return;

        const prefixedState = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(`${prefix}_`)) {
            const stateKey = key.replace(`${prefix}_`, '');
            const value = localStorage.getItem(key);
            prefixedState[stateKey] = value ? JSON.parse(value) : null;
          }
        }
        setState(prefixedState);
      } catch (error) {
        console.warn('Error loading prefixed localStorage values:', error);
      }
    };

    loadPrefixedValues();
  }, [prefix]);

  // Set a prefixed value
  const setPrefixedValue = useCallback((key, value) => {
    try {
      const fullKey = `${prefix}_${key}`;
      const valueToStore = value instanceof Function ? value(state[key]) : value;
      
      setState(prev => ({ ...prev, [key]: valueToStore }));
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(fullKey, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting prefixed localStorage key "${key}":`, error);
    }
  }, [prefix, state]);

  // Remove a prefixed value
  const removePrefixedValue = useCallback((key) => {
    try {
      const fullKey = `${prefix}_${key}`;
      
      setState(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(fullKey);
      }
    } catch (error) {
      console.warn(`Error removing prefixed localStorage key "${key}":`, error);
    }
  }, [prefix]);

  // Clear all prefixed values
  const clearPrefixedValues = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;

      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${prefix}_`)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      setState({});
    } catch (error) {
      console.warn('Error clearing prefixed localStorage values:', error);
    }
  }, [prefix]);

  return {
    state,
    setValue: setPrefixedValue,
    removeValue: removePrefixedValue,
    clearAll: clearPrefixedValues
  };
};

// Hook for managing user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'en',
    notifications: true,
    autoSave: true,
    offlineMode: false,
    studyReminders: true,
    soundEffects: true,
    reducedMotion: false
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    removePreferences();
  }, [removePreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    setPreferences
  };
};

// Hook for managing offline data cache
export const useOfflineCache = () => {
  const [cache, setCache, removeCache] = useLocalStorage('offlineCache', {
    lastSync: null,
    userData: null,
    studyMaterials: [],
    quizData: [],
    progressData: null
  });

  const updateCache = useCallback((key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: data,
      lastSync: new Date().toISOString()
    }));
  }, [setCache]);

  const clearCache = useCallback(() => {
    removeCache();
  }, [removeCache]);

  const getCacheAge = useCallback(() => {
    if (!cache.lastSync) return null;
    return Date.now() - new Date(cache.lastSync).getTime();
  }, [cache.lastSync]);

  const isCacheStale = useCallback((maxAge = 24 * 60 * 60 * 1000) => { // 24 hours default
    const age = getCacheAge();
    return age === null || age > maxAge;
  }, [getCacheAge]);

  return {
    cache,
    updateCache,
    clearCache,
    getCacheAge,
    isCacheStale,
    setCache
  };
};

// Hook for managing study session data
export const useStudySession = () => {
  const [session, setSession, removeSession] = useLocalStorage('currentStudySession', {
    isActive: false,
    startTime: null,
    endTime: null,
    subject: null,
    topics: [],
    notes: '',
    breaksTaken: 0,
    totalTime: 0
  });

  const startSession = useCallback((subject, topics = []) => {
    setSession({
      isActive: true,
      startTime: new Date().toISOString(),
      endTime: null,
      subject,
      topics,
      notes: '',
      breaksTaken: 0,
      totalTime: 0
    });
  }, [setSession]);

  const endSession = useCallback(() => {
    if (session.isActive && session.startTime) {
      const endTime = new Date().toISOString();
      const totalTime = new Date(endTime) - new Date(session.startTime);
      
      setSession(prev => ({
        ...prev,
        isActive: false,
        endTime,
        totalTime
      }));
    }
  }, [session, setSession]);

  const takeBreak = useCallback(() => {
    setSession(prev => ({
      ...prev,
      breaksTaken: prev.breaksTaken + 1
    }));
  }, [setSession]);

  const updateNotes = useCallback((notes) => {
    setSession(prev => ({
      ...prev,
      notes
    }));
  }, [setSession]);

  const clearSession = useCallback(() => {
    removeSession();
  }, [removeSession]);

  return {
    session,
    startSession,
    endSession,
    takeBreak,
    updateNotes,
    clearSession,
    isActive: session.isActive
  };
};

// Utility function to check localStorage availability
export const isLocalStorageAvailable = () => {
  try {
    if (typeof window === 'undefined') return false;
    
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

// Utility function to get localStorage usage
export const getLocalStorageUsage = () => {
  if (!isLocalStorageAvailable()) return null;

  let totalSize = 0;
  const usage = {};

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = (localStorage[key].length + key.length) * 2; // Approximate size in bytes
      usage[key] = size;
      totalSize += size;
    }
  }

  return {
    total: totalSize,
    items: usage,
    formatted: {
      total: `${(totalSize / 1024).toFixed(2)} KB`,
      items: Object.fromEntries(
        Object.entries(usage).map(([key, size]) => [key, `${(size / 1024).toFixed(2)} KB`])
      )
    }
  };
};

export default useLocalStorage;
