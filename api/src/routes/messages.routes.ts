import { authMiddleware } from "./../middleware";
import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { 
  sendMessageSchema, 
  updateMessageSchema,
  createConversationSchema,
  messageSearchSchema 
} from '../schemas/message.schemas';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authMiddleware);

// Conversations
router.get('/conversations', messageController.getConversations);
router.post('/conversations', 
  validationMiddleware(createConversationSchema),
  messageController.createConversation
);

router.get('/conversations/:conversationId', messageController.getConversation);
router.put('/conversations/:conversationId', messageController.updateConversation);
router.delete('/conversations/:conversationId', messageController.deleteConversation);

// Conversation participants
router.post('/conversations/:conversationId/participants', messageController.addParticipant);
router.delete('/conversations/:conversationId/participants/:userId', messageController.removeParticipant);
router.get('/conversations/:conversationId/participants', messageController.getParticipants);

// Messages
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.post('/conversations/:conversationId/messages', 
  validationMiddleware(sendMessageSchema),
  uploadMiddleware.array('attachments', 5),
  messageController.sendMessage
);

router.get('/messages/:messageId', messageController.getMessageById);
router.put('/messages/:messageId', 
  validationMiddleware(updateMessageSchema),
  messageController.updateMessage
);

router.delete('/messages/:messageId', messageController.deleteMessage);

// Message interactions
router.post('/messages/:messageId/read', messageController.markAsRead);
router.post('/messages/:messageId/unread', messageController.markAsUnread);
router.post('/conversations/:conversationId/read-all', messageController.markAllAsRead);

router.post('/messages/:messageId/react', messageController.addReaction);
router.delete('/messages/:messageId/react', messageController.removeReaction);

router.post('/messages/:messageId/reply', 
  validationMiddleware(sendMessageSchema),
  messageController.replyToMessage
);

// Message forwarding and sharing
router.post('/messages/:messageId/forward', messageController.forwardMessage);
router.post('/messages/:messageId/share', messageController.shareMessage);

// Search and filters
router.get('/search', 
  validationMiddleware(messageSearchSchema, 'query'),
  messageController.searchMessages
);

router.get('/unread', messageController.getUnreadMessages);
router.get('/unread/count', messageController.getUnreadCount);

// File attachments
router.get('/attachments/:attachmentId', messageController.getAttachment);
router.delete('/attachments/:attachmentId', messageController.deleteAttachment);
router.get('/conversations/:conversationId/attachments', messageController.getConversationAttachments);

// Message status and delivery
router.get('/messages/:messageId/status', messageController.getMessageStatus);
router.post('/messages/:messageId/delivered', messageController.markAsDelivered);

// Conversation settings
router.get('/conversations/:conversationId/settings', messageController.getConversationSettings);
router.put('/conversations/:conversationId/settings', messageController.updateConversationSettings);

// Mute and notifications
router.post('/conversations/:conversationId/mute', messageController.muteConversation);
router.delete('/conversations/:conversationId/mute', messageController.unmuteConversation);

// Archive and favorites
router.post('/conversations/:conversationId/archive', messageController.archiveConversation);
router.delete('/conversations/:conversationId/archive', messageController.unarchiveConversation);
router.get('/archived', messageController.getArchivedConversations);

router.post('/conversations/:conversationId/favorite', messageController.favoriteConversation);
router.delete('/conversations/:conversationId/favorite', messageController.unfavoriteConversation);
router.get('/favorites', messageController.getFavoriteConversations);

// Group messaging features
router.post('/groups', messageController.createGroupConversation);
router.put('/conversations/:conversationId/group-info', messageController.updateGroupInfo);
router.post('/conversations/:conversationId/leave', messageController.leaveGroup);

// Admin features for group conversations
router.post('/conversations/:conversationId/admins/:userId', messageController.promoteToAdmin);
router.delete('/conversations/:conversationId/admins/:userId', messageController.demoteFromAdmin);

// Block and report
router.post('/users/:userId/block', messageController.blockUser);
router.delete('/users/:userId/block', messageController.unblockUser);
router.get('/blocked', messageController.getBlockedUsers);

router.post('/conversations/:conversationId/report', messageController.reportConversation);
router.post('/messages/:messageId/report', messageController.reportMessage);

// Message templates and quick replies
router.get('/templates', messageController.getMessageTemplates);
router.post('/templates', messageController.createMessageTemplate);
router.put('/templates/:templateId', messageController.updateMessageTemplate);
router.delete('/templates/:templateId', messageController.deleteMessageTemplate);

// Typing indicators
router.post('/conversations/:conversationId/typing', messageController.sendTypingIndicator);
router.delete('/conversations/:conversationId/typing', messageController.stopTypingIndicator);

// Message scheduling
router.post('/messages/schedule', messageController.scheduleMessage);
router.get('/messages/scheduled', messageController.getScheduledMessages);
router.put('/messages/scheduled/:messageId', messageController.updateScheduledMessage);
router.delete('/messages/scheduled/:messageId', messageController.cancelScheduledMessage);

// Export and backup
router.get('/conversations/:conversationId/export', messageController.exportConversation);
router.get('/export-all', messageController.exportAllConversations);

export default router;
