import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Check notification support and permission
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);

  // Initialize WebSocket connection for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const connectWebSocket = () => {
      try {
        const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/notifications?token=${token}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Notification WebSocket connected');
          // Clear any reconnection timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        };

        wsRef.current.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            handleNewNotification(notification);
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        };

        wsRef.current.onclose = () => {
          console.log('Notification WebSocket disconnected');
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        };

        wsRef.current.onerror = (error) => {
          console.error('Notification WebSocket error:', error);
        };
      } catch (error) {
        console.error('Failed to connect to notification WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Load initial notifications
  const loadNotifications = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
      const { notifications: newNotifications, unreadCount: count } = response.data;
      
      if (page === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      setUnreadCount(count);
      return { success: true, notifications: newNotifications };
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (permission === 'granted' && notification.showBrowserNotification) {
      showBrowserNotification(notification);
    }
    
    // Play sound if enabled
    playNotificationSound(notification.type);
  }, [permission]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return { success: false, error: 'Notifications not supported' };
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        return { success: true, permission: result };
      } else {
        return { success: false, permission: result, error: 'Permission denied' };
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { success: false, error: error.message };
    }
  }, [isSupported]);

  // Show browser notification
  const showBrowserNotification = useCallback((notification) => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/logo192.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high',
        silent: notification.silent || false
      });

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds for low priority notifications
      if (notification.priority !== 'high') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }, [isSupported, permission]);

  // Play notification sound
  const playNotificationSound = useCallback((type) => {
    try {
      const soundMap = {
        message: '/sounds/message.mp3',
        achievement: '/sounds/achievement.mp3',
        reminder: '/sounds/reminder.mp3',
        alert: '/sounds/alert.mp3',
        default: '/sounds/notification.mp3'
      };

      const soundFile = soundMap[type] || soundMap.default;
      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-all-read');
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      setUnreadCount(0);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const filtered = prev.filter(n => n.id !== notificationId);
        
        // Decrease unread count if the deleted notification was unread
        if (notification && !notification.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        
        return filtered;
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete('/notifications/clear-all');
      
      setNotifications([]);
      setUnreadCount(0);
      
      return { success: true };
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Send a notification (for testing or admin purposes)
  const sendNotification = useCallback(async (notificationData) => {
    try {
      const response = await api.post('/notifications/send', notificationData);
      return { success: true, notification: response.data };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (preferences) => {
    try {
      await api.put('/notifications/preferences', preferences);
      return { success: true };
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Schedule a local notification (for study reminders, etc.)
  const scheduleLocalNotification = useCallback((title, message, delay) => {
    if (!isSupported || permission !== 'granted') {
      return { success: false, error: 'Notifications not available' };
    }

    try {
      const timeoutId = setTimeout(() => {
        showBrowserNotification({
          id: `local-${Date.now()}`,
          title,
          message,
          icon: '/logo192.png',
          priority: 'normal',
          type: 'reminder'
        });
      }, delay);

      return { success: true, timeoutId };
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      return { success: false, error: error.message };
    }
  }, [isSupported, permission, showBrowserNotification]);

  // Cancel scheduled notification
  const cancelScheduledNotification = useCallback((timeoutId) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      return { success: true };
    }
    return { success: false, error: 'Invalid timeout ID' };
  }, []);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const stats = {
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
      byType: {}
    };

    notifications.forEach(notification => {
      const type = notification.type || 'other';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }, [notifications, unreadCount]);

  // Filter notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Filter notifications by read status
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.isRead);
  }, [notifications]);

  // Check if notification settings are properly configured
  const isConfigured = useCallback(() => {
    return isSupported && permission === 'granted';
  }, [isSupported, permission]);

  // Create study reminder notification
  const createStudyReminder = useCallback((subject, time) => {
    return scheduleLocalNotification(
      'Study Reminder',
      `Time to study ${subject}!`,
      time - Date.now()
    );
  }, [scheduleLocalNotification]);

  // Create break reminder notification
  const createBreakReminder = useCallback((duration = 15) => {
    return scheduleLocalNotification(
      'Break Time!',
      `You've been studying for a while. Take a ${duration} minute break.`,
      0 // Immediate notification
    );
  }, [scheduleLocalNotification]);

  // Create achievement notification
  const createAchievementNotification = useCallback((achievement) => {
    if (isConfigured()) {
      showBrowserNotification({
        id: `achievement-${achievement.id}`,
        title: '🎉 Achievement Unlocked!',
        message: achievement.title,
        icon: '/achievement-icon.png',
        priority: 'normal',
        type: 'achievement',
        actionUrl: `/achievements/${achievement.id}`
      });
    }
  }, [isConfigured, showBrowserNotification]);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    permission,
    isSupported,
    
    // Actions
    loadNotifications,
    requestPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    sendNotification,
    updatePreferences,
    scheduleLocalNotification,
    cancelScheduledNotification,
    
    // Specialized notifications
    createStudyReminder,
    createBreakReminder,
    createAchievementNotification,
    
    // Utilities
    getNotificationStats,
    getNotificationsByType,
    getUnreadNotifications,
    isConfigured,
    
    // Manual notification display
    showBrowserNotification,
    playNotificationSound
  };
};

export default useNotifications;
