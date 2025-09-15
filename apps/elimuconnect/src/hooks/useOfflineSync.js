import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';
import useLocalStorage from './useLocalStorage';

const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage('lastSyncTime', null);
  const [syncErrors, setSyncErrors] = useState([]);
  const [pendingData, setPendingData] = useLocalStorage('pendingData', {
    progress: [],
    achievements: [],
    studySessions: [],
    quizResults: [],
    notes: [],
    bookmarks: [],
    settings: []
  });

  const syncIntervalRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App is online');
      // Trigger sync when coming back online
      setTimeout(syncToServer, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('App is offline');
      setSyncing(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set up periodic sync when online
  useEffect(() => {
    if (isOnline) {
      // Sync every 5 minutes when online
      syncIntervalRef.current = setInterval(() => {
        syncToServer();
      }, 5 * 60 * 1000);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline]);

  // Add data to pending queue when offline
  const addToPendingQueue = useCallback((type, data) => {
    const pendingItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    };

    setPendingData(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), pendingItem]
    }));

    return pendingItem.id;
  }, [setPendingData]);

  // Remove item from pending queue
  const removeFromPendingQueue = useCallback((type, itemId) => {
    setPendingData(prev => ({
      ...prev,
      [type]: prev[type]?.filter(item => item.id !== itemId) || []
    }));
  }, [setPendingData]);

  // Get total pending items count
  const getPendingCount = useCallback(() => {
    return Object.values(pendingData).reduce((total, items) => total + items.length, 0);
  }, [pendingData]);

  // Sync specific data type to server
  const syncDataType = useCallback(async (type, items) => {
    const results = [];
    
    for (const item of items) {
      try {
        let response;
        
        switch (type) {
          case 'progress':
            response = await api.post('/sync/progress', item.data);
            break;
          case 'achievements':
            response = await api.post('/sync/achievements', item.data);
            break;
          case 'studySessions':
            response = await api.post('/sync/study-sessions', item.data);
            break;
          case 'quizResults':
            response = await api.post('/sync/quiz-results', item.data);
            break;
          case 'notes':
            response = await api.post('/sync/notes', item.data);
            break;
          case 'bookmarks':
            response = await api.post('/sync/bookmarks', item.data);
            break;
          case 'settings':
            response = await api.post('/sync/settings', item.data);
            break;
          default:
            throw new Error(`Unknown sync type: ${type}`);
        }

        results.push({ item, success: true, response: response.data });
        removeFromPendingQueue(type, item.id);
        
      } catch (error) {
        console.error(`Failed to sync ${type} item:`, error);
        
        // Increment retry count
        const updatedItem = { ...item, retries: item.retries + 1 };
        
        // Remove from queue if too many retries
        if (updatedItem.retries >= 3) {
          removeFromPendingQueue(type, item.id);
          setSyncErrors(prev => [...prev, {
            id: item.id,
            type,
            error: error.message,
            timestamp: new Date().toISOString()
          }]);
        } else {
          // Update retry count in pending data
          setPendingData(prev => ({
            ...prev,
            [type]: prev[type].map(pendingItem => 
              pendingItem.id === item.id ? updatedItem : pendingItem
            )
          }));
        }
        
        results.push({ item, success: false, error: error.message });
      }
    }
    
    return results;
  }, [removeFromPendingQueue, setPendingData]);

  // Main sync function
  const syncToServer = useCallback(async () => {
    if (!isOnline || syncing) return;

    const pendingCount = getPendingCount();
    if (pendingCount === 0) return;

    setSyncing(true);
    setSyncProgress(0);
    setSyncErrors([]);

    try {
      console.log(`Starting sync of ${pendingCount} items`);
      
      const syncTypes = Object.keys(pendingData).filter(type => pendingData[type].length > 0);
      let completedItems = 0;
      const totalItems = pendingCount;

      for (const type of syncTypes) {
        const items = pendingData[type];
        if (items.length === 0) continue;

        console.log(`Syncing ${items.length} ${type} items`);
        
        const results = await syncDataType(type, items);
        completedItems += results.length;
        
        // Update progress
        setSyncProgress((completedItems / totalItems) * 100);
      }

      setLastSyncTime(new Date().toISOString());
      console.log('Sync completed successfully');
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncErrors(prev => [...prev, {
        id: `sync_${Date.now()}`,
        type: 'general',
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setSyncing(false);
      setSyncProgress(0);
    }
  }, [isOnline, syncing, getPendingCount, pendingData, syncDataType, setLastSyncTime]);

  // Force sync (manual trigger)
  const forceSync = useCallback(async () => {
    if (!isOnline) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      await syncToServer();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [isOnline, syncToServer]);

  // Sync progress data
  const syncProgress = useCallback((progressData) => {
    if (isOnline) {
      // Try immediate sync
      api.post('/sync/progress', progressData).catch(() => {
        // If immediate sync fails, add to queue
        addToPendingQueue('progress', progressData);
      });
    } else {
      // Add to offline queue
      addToPendingQueue('progress', progressData);
    }
  }, [isOnline, addToPendingQueue]);

  // Sync quiz results
  const syncQuizResult = useCallback((quizData) => {
    if (isOnline) {
      api.post('/sync/quiz-results', quizData).catch(() => {
        addToPendingQueue('quizResults', quizData);
      });
    } else {
      addToPendingQueue('quizResults', quizData);
    }
  }, [isOnline, addToPendingQueue]);

  // Sync study session
  const syncStudySession = useCallback((sessionData) => {
    if (isOnline) {
      api.post('/sync/study-sessions', sessionData).catch(() => {
        addToPendingQueue('studySessions', sessionData);
      });
    } else {
      addToPendingQueue('studySessions', sessionData);
    }
  }, [isOnline, addToPendingQueue]);

  // Sync user notes
  const syncNotes = useCallback((notesData) => {
    if (isOnline) {
      api.post('/sync/notes', notesData).catch(() => {
        addToPendingQueue('notes', notesData);
      });
    } else {
      addToPendingQueue('notes', notesData);
    }
  }, [isOnline, addToPendingQueue]);

  // Sync bookmarks
  const syncBookmarks = useCallback((bookmarkData) => {
    if (isOnline) {
      api.post('/sync/bookmarks', bookmarkData).catch(() => {
        addToPendingQueue('bookmarks', bookmarkData);
      });
    } else {
      addToPendingQueue('bookmarks', bookmarkData);
    }
  }, [isOnline, addToPendingQueue]);

  // Sync settings
  const syncSettings = useCallback((settingsData) => {
    if (isOnline) {
      api.post('/sync/settings', settingsData).catch(() => {
        addToPendingQueue('settings', settingsData);
      });
    } else {
      addToPendingQueue('settings', settingsData);
    }
  }, [isOnline, addToPendingQueue]);

  // Download data for offline use
  const downloadForOffline = useCallback(async (dataTypes = ['content', 'quizzes', 'notes']) => {
    if (!isOnline) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const downloadPromises = dataTypes.map(async (type) => {
        const response = await api.get(`/offline/download/${type}`);
        localStorage.setItem(`offline_${type}`, JSON.stringify({
          data: response.data,
          timestamp: new Date().toISOString()
        }));
        return { type, success: true };
      });

      const results = await Promise.all(downloadPromises);
      return { success: true, results };
    } catch (error) {
      console.error('Failed to download offline data:', error);
      return { success: false, error: error.message };
    }
  }, [isOnline]);

  // Get offline data
  const getOfflineData = useCallback((type) => {
    try {
      const storedData = localStorage.getItem(`offline_${type}`);
      if (!storedData) return null;

      const parsedData = JSON.parse(storedData);
      return parsedData.data;
    } catch (error) {
      console.error(`Failed to get offline data for ${type}:`, error);
      return null;
    }
  }, []);

  // Clear offline data
  const clearOfflineData = useCallback((type = null) => {
    try {
      if (type) {
        localStorage.removeItem(`offline_${type}`);
      } else {
        // Clear all offline data
        const keys = Object.keys(localStorage).filter(key => key.startsWith('offline_'));
        keys.forEach(key => localStorage.removeItem(key));
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Get sync status
  const getSyncStatus = useCallback(() => {
    const pendingCount = getPendingCount();
    const hasErrors = syncErrors.length > 0;
    
    return {
      isOnline,
      syncing,
      pendingCount,
      hasErrors,
      lastSyncTime,
      syncProgress,
      errors: syncErrors,
      needsSync: pendingCount > 0
    };
  }, [isOnline, syncing, getPendingCount, syncErrors, lastSyncTime, syncProgress]);

  // Clear sync errors
  const clearSyncErrors = useCallback(() => {
    setSyncErrors([]);
  }, []);

  // Retry failed syncs
  const retryFailedSyncs = useCallback(async () => {
    if (!isOnline) {
      return { success: false, error: 'Device is offline' };
    }

    // Reset retry counts for all pending items
    setPendingData(prev => {
      const updated = {};
      Object.keys(prev).forEach(type => {
        updated[type] = prev[type].map(item => ({ ...item, retries: 0 }));
      });
      return updated;
    });

    // Clear errors and retry sync
    clearSyncErrors();
    await syncToServer();
    
    return { success: true };
  }, [isOnline, setPendingData, clearSyncErrors, syncToServer]);

  // Get storage usage for offline data
  const getOfflineStorageUsage = useCallback(() => {
    let totalSize = 0;
    const usage = {};

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('offline_') || key.startsWith('pendingData')) {
        const size = localStorage.getItem(key).length * 2; // Approximate size in bytes
        usage[key] = size;
        totalSize += size;
      }
    });

    return {
      total: totalSize,
      items: usage,
      formatted: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
    };
  }, []);

  return {
    // State
    isOnline,
    syncing,
    syncProgress,
    lastSyncTime,
    syncErrors,
    pendingData,

    // Sync actions
    syncToServer,
    forceSync,
    retryFailedSyncs,

    // Data sync methods
    syncProgress,
    syncQuizResult,
    syncStudySession,
    syncNotes,
    syncBookmarks,
    syncSettings,

    // Offline data management
    downloadForOffline,
    getOfflineData,
    clearOfflineData,

    // Queue management
    addToPendingQueue,
    removeFromPendingQueue,
    getPendingCount,

    // Utilities
    getSyncStatus,
    clearSyncErrors,
    getOfflineStorageUsage
  };
};

export default useOfflineSync;
