// api/src/sockets/index.ts
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@elimuconnect/shared/utils';
import { JwtPayload } from '@elimuconnect/shared/types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function setupSocketHandlers(io: Server): void {
  // Authentication middleware for Socket.IO
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      
      logger.info(`Socket authenticated for user: ${decoded.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    
    logger.info(`User connected: ${userId} (Socket: ${socket.id})`);

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Handle joining study groups
    socket.on('join_study_group', (groupId: string) => {
      socket.join(`group_${groupId}`);
      logger.info(`User ${userId} joined study group: ${groupId}`);
    });

    // Handle leaving study groups
    socket.on('leave_study_group', (groupId: string) => {
      socket.leave(`group_${groupId}`);
      logger.info(`User ${userId} left study group: ${groupId}`);
    });

    // Handle direct messages
    socket.on('send_message', (data: {
      recipientId?: string;
      groupId?: string;
      content: string;
      type: 'text' | 'file' | 'image' | 'audio';
    }) => {
      if (data.recipientId) {
        // Direct message
        io.to(`user_${data.recipientId}`).emit('new_message', {
          senderId: userId,
          content: data.content,
          type: data.type,
          timestamp: new Date()
        });
      } else if (data.groupId) {
        // Group message
        socket.to(`group_${data.groupId}`).emit('new_group_message', {
          senderId: userId,
          groupId: data.groupId,
          content: data.content,
          type: data.type,
          timestamp: new Date()
        });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { recipientId?: string; groupId?: string }) => {
      if (data.recipientId) {
        io.to(`user_${data.recipientId}`).emit('user_typing', { userId, typing: true });
      } else if (data.groupId) {
        socket.to(`group_${data.groupId}`).emit('user_typing', { userId, typing: true });
      }
    });

    socket.on('typing_stop', (data: { recipientId?: string; groupId?: string }) => {
      if (data.recipientId) {
        io.to(`user_${data.recipientId}`).emit('user_typing', { userId, typing: false });
      } else if (data.groupId) {
        socket.to(`group_${data.groupId}`).emit('user_typing', { userId, typing: false });
      }
    });

    // Handle quiz sessions (for real-time quiz participation)
    socket.on('join_quiz', (quizId: string) => {
      socket.join(`quiz_${quizId}`);
      logger.info(`User ${userId} joined quiz: ${quizId}`);
    });

    socket.on('leave_quiz', (quizId: string) => {
      socket.leave(`quiz_${quizId}`);
      logger.info(`User ${userId} left quiz: ${quizId}`);
    });

    // Handle discussion forum real-time updates
    socket.on('join_discussion', (discussionId: string) => {
      socket.join(`discussion_${discussionId}`);
    });

    socket.on('leave_discussion', (discussionId: string) => {
      socket.leave(`discussion_${discussionId}`);
    });

    // Handle user status updates
    socket.on('update_status', (status: 'online' | 'away' | 'busy' | 'offline') => {
      socket.broadcast.emit('user_status_update', { userId, status });
    });

    // Handle voice/video calls (basic signaling)
    socket.on('call_user', (data: { recipientId: string; offer: any }) => {
      io.to(`user_${data.recipientId}`).emit('incoming_call', {
        callerId: userId,
        offer: data.offer
      });
    });

    socket.on('answer_call', (data: { callerId: string; answer: any }) => {
      io.to(`user_${data.callerId}`).emit('call_answered', {
        answer: data.answer
      });
    });

    socket.on('ice_candidate', (data: { targetId: string; candidate: any }) => {
      io.to(`user_${data.targetId}`).emit('ice_candidate', {
        candidate: data.candidate,
        senderId: userId
      });
    });

    socket.on('end_call', (data: { targetId: string }) => {
      io.to(`user_${data.targetId}`).emit('call_ended', { senderId: userId });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${userId} (Reason: ${reason})`);
      
      // Broadcast user offline status
      socket.broadcast.emit('user_status_update', { 
        userId, 
        status: 'offline',
        lastSeen: new Date()
      });
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Successfully connected to ElimuConnect',
      userId,
      timestamp: new Date()
    });
  });

  logger.info('🔌 Socket.IO handlers setup complete');
}
