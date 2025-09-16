// This file should be saved as: api/src/sockets/socketHandlers.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export function initializeSocketIO(io: SocketIOServer): void {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      socket.userId = decoded.userId;
      socket.user = decoded;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User ${socket.userId} connected via Socket.IO`);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle real-time messaging
    setupMessagingHandlers(socket, io);

    // Handle discussion/forum real-time updates
    setupDiscussionHandlers(socket, io);

    // Handle study group activities
    setupStudyGroupHandlers(socket, io);

    // Handle notifications
    setupNotificationHandlers(socket, io);

    // Handle typing indicators
    setupTypingHandlers(socket, io);

    // Handle user presence
    setupPresenceHandlers(socket, io);

    // Handle collaboration features
    setupCollaborationHandlers(socket, io);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected from Socket.IO`);
      
      // Update user status to offline
      socket.broadcast.emit('user:offline', { userId: socket.userId });
      
      // Leave all rooms
      socket.leave(`user:${socket.userId}`);
    });
  });
}

function setupMessagingHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  // Join conversation room
  socket.on('conversation:join', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    logger.info(`User ${socket.userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    logger.info(`User ${socket.userId} left conversation ${conversationId}`);
  });

  // Send message
  socket.on('message:send', (data: any) => {
    const { conversationId, message, type = 'text' } = data;
    
    // Emit to all users in the conversation
    socket.to(`conversation:${conversationId}`).emit('message:new', {
      id: generateMessageId(),
      conversationId,
      senderId: socket.userId,
      content: message,
      type,
      timestamp: new Date(),
      sender: {
        id: socket.userId,
        name: socket.user?.name,
        avatar: socket.user?.avatar
      }
    });
  });

  // Message read status
  socket.on('message:read', (data: any) => {
    const { conversationId, messageId } = data;
    
    socket.to(`conversation:${conversationId}`).emit('message:read', {
      messageId,
      readBy: socket.userId,
      timestamp: new Date()
    });
  });
}

function setupDiscussionHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  // Join discussion room
  socket.on('discussion:join', (discussionId: string) => {
    socket.join(`discussion:${discussionId}`);
    logger.info(`User ${socket.userId} joined discussion ${discussionId}`);
  });

  // Leave discussion room
  socket.on('discussion:leave', (discussionId: string) => {
    socket.leave(`discussion:${discussionId}`);
  });

  // New reply in discussion
  socket.on('discussion:reply', (data: any) => {
    const { discussionId, reply } = data;
    
    socket.to(`discussion:${discussionId}`).emit('discussion:new_reply', {
      discussionId,
      reply: {
        ...reply,
        author: {
          id: socket.userId,
          name: socket.user?.name,
          avatar: socket.user?.avatar
        },
        timestamp: new Date()
      }
    });
  });

  // Like/Unlike discussion or reply
  socket.on('discussion:like', (data: any) => {
    const { discussionId, targetId, type, action } = data; // type: 'discussion' | 'reply', action: 'like' | 'unlike'
    
    socket.to(`discussion:${discussionId}`).emit('discussion:like_update', {
      targetId,
      type,
      action,
      userId: socket.userId,
      timestamp: new Date()
    });
  });
}

function setupStudyGroupHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  // Join study group room
  socket.on('study_group:join', (groupId: string) => {
    socket.join(`study_group:${groupId}`);
    
    // Notify other members
    socket.to(`study_group:${groupId}`).emit('study_group:member_joined', {
      groupId,
      member: {
        id: socket.userId,
        name: socket.user?.name,
        avatar: socket.user?.avatar
      },
      timestamp: new Date()
    });
  });

  // Leave study group room
  socket.on('study_group:leave', (groupId: string) => {
    socket.leave(`study_group:${groupId}`);
    
    // Notify other members
    socket.to(`study_group:${groupId}`).emit('study_group:member_left', {
      groupId,
      memberId: socket.userId,
      timestamp: new Date()
    });
  });

  // Study session updates
  socket.on('study_session:start', (data: any) => {
    const { groupId, sessionData } = data;
    
    socket.to(`study_group:${groupId}`).emit('study_session:started', {
      groupId,
      session: {
        ...sessionData,
        startedBy: socket.userId,
        timestamp: new Date()
      }
    });
  });

  // Collaborative note-taking
  socket.on('note:update', (data: any) => {
    const { groupId, noteId, content, operation } = data;
    
    socket.to(`study_group:${groupId}`).emit('note:updated', {
      noteId,
      content,
      operation,
      updatedBy: socket.userId,
      timestamp: new Date()
    });
  });
}

function setupNotificationHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  // Send notification to specific user
  socket.on('notification:send', (data: any) => {
    const { targetUserId, notification } = data;
    
    io.to(`user:${targetUserId}`).emit('notification:new', {
      ...notification,
      timestamp: new Date()
    });
  });

  // Mark notification as read
  socket.on('notification:read', (notificationId: string) => {
    // This would typically update the database
    socket.emit('notification:read_confirmed', { notificationId });
  });
}

function setupTypingHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  // Typing in conversation
  socket.on('typing:start', (data: any) => {
    const { conversationId } = data;
    
    socket.to(`conversation:${conversationId}`).emit('typing:user_started', {
      userId: socket.userId,
      userName: socket.user?.name,
      conversationId
    });
  });

  socket.on('typing:stop', (data: any) => {
    const { conversationId } = data;
    
    socket.to(`conversation:${conversationId}`).emit('typing:user_stopped', {
      userId: socket.userId,
      conversationId
    });
  });

  // Typing in discussion
  socket.on('discussion:typing:start', (data: any) => {
    const { discussionId } = data;
    
    socket.to(`discussion:${discussionId}`).emit('discussion:typing:user_started', {
      userId: socket.userId,
      userName: socket.user?.name,
      discussionId
    });
  });

  socket.on('discussion:typing:stop', (data: any) => {
    const { discussionId } = data;
    
    socket.to(`discussion:${discussionId}`).emit('discussion:typing:user_stopped', {
      userId: socket.userId,
      discussionId
    });
  });
}

function setupPresenceHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  // User comes online
  socket.emit('user:online', {
    userId: socket.userId,
    timestamp: new Date()
  });

  // Broadcast to friends/contacts
  socket.broadcast.emit('user:online', {
    userId: socket.userId,
    timestamp: new Date()
  });

  // Update user status
  socket.on('status:update', (status: string) => {
    socket.broadcast.emit('user:status_updated', {
      userId: socket.userId,
      status,
      timestamp: new Date()
    });
  });

  // User activity (studying, reading, etc.)
  socket.on('activity:update', (activity: any) => {
    socket.broadcast.emit('user:activity_updated', {
      userId: socket.userId,
      activity,
      timestamp: new Date()
    });
  });
}

function setupCollaborationHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  // Real-time document editing
  socket.on('document:edit', (data: any) => {
    const { documentId, operation, content } = data;
    
    socket.to(`document:${documentId}`).emit('document:updated', {
      documentId,
      operation,
      content,
      editedBy: socket.userId,
      timestamp: new Date()
    });
  });

  // Join document editing session
  socket.on('document:join', (documentId: string) => {
    socket.join(`document:${documentId}`);
    
    socket.to(`document:${documentId}`).emit('document:user_joined', {
      documentId,
      user: {
        id: socket.userId,
        name: socket.user?.name,
        avatar: socket.user?.avatar
      }
    });
  });

  // Leave document editing session
  socket.on('document:leave', (documentId: string) => {
    socket.leave(`document:${documentId}`);
    
    socket.to(`document:${documentId}`).emit('document:user_left', {
      documentId,
      userId: socket.userId
    });
  });

  // Cursor position in collaborative editing
  socket.on('cursor:update', (data: any) => {
    const { documentId, position } = data;
    
    socket.to(`document:${documentId}`).emit('cursor:updated', {
      userId: socket.userId,
      userName: socket.user?.name,
      position,
      timestamp: new Date()
    });
  });
}

// Utility function to generate message ID
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
