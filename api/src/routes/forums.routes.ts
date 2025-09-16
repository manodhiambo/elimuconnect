import { Router } from 'express';
import { ForumController } from '../controllers/forum.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { 
  createDiscussionSchema, 
  updateDiscussionSchema,
  createReplySchema,
  updateReplySchema,
  discussionSearchSchema 
} from '../schemas/discussion.schemas';

const router = Router();
const forumController = new ForumController();

// Public routes
router.get('/discussions', 
  validationMiddleware(discussionSearchSchema, 'query'),
  forumController.getAllDiscussions
);

router.get('/discussions/search', 
  validationMiddleware(discussionSearchSchema, 'query'),
  forumController.searchDiscussions
);

router.get('/discussions/trending', forumController.getTrendingDiscussions);
router.get('/discussions/recent', forumController.getRecentDiscussions);
router.get('/discussions/featured', forumController.getFeaturedDiscussions);

router.get('/discussions/:discussionId', forumController.getDiscussionById);
router.get('/discussions/:discussionId/replies', forumController.getDiscussionReplies);

// Categories and tags
router.get('/categories', forumController.getAllCategories);
router.get('/categories/:categoryId/discussions', forumController.getDiscussionsByCategory);
router.get('/tags', forumController.getAllTags);
router.get('/tags/:tag/discussions', forumController.getDiscussionsByTag);

// Subject-specific forums
router.get('/subjects', forumController.getAllSubjects);
router.get('/subjects/:subject/discussions', forumController.getDiscussionsBySubject);

// Protected routes
router.use(authMiddleware);

// Discussion management
router.post('/discussions', 
  validationMiddleware(createDiscussionSchema),
  uploadMiddleware.array('attachments', 5),
  forumController.createDiscussion
);

router.put('/discussions/:discussionId', 
  validationMiddleware(updateDiscussionSchema),
  forumController.updateDiscussion
);

router.delete('/discussions/:discussionId', forumController.deleteDiscussion);

// Discussion interactions
router.post('/discussions/:discussionId/like', forumController.likeDiscussion);
router.delete('/discussions/:discussionId/like', forumController.unlikeDiscussion);

router.post('/discussions/:discussionId/bookmark', forumController.bookmarkDiscussion);
router.delete('/discussions/:discussionId/bookmark', forumController.unbookmarkDiscussion);
router.get('/bookmarks', forumController.getBookmarkedDiscussions);

router.post('/discussions/:discussionId/follow', forumController.followDiscussion);
router.delete('/discussions/:discussionId/follow', forumController.unfollowDiscussion);
router.get('/followed', forumController.getFollowedDiscussions);

router.post('/discussions/:discussionId/report', forumController.reportDiscussion);

// Replies management
router.post('/discussions/:discussionId/replies', 
  validationMiddleware(createReplySchema),
  uploadMiddleware.array('attachments', 3),
  forumController.createReply
);

router.put('/replies/:replyId', 
  validationMiddleware(updateReplySchema),
  forumController.updateReply
);

router.delete('/replies/:replyId', forumController.deleteReply);

// Reply interactions
router.post('/replies/:replyId/like', forumController.likeReply);
router.delete('/replies/:replyId/like', forumController.unlikeReply);

router.post('/replies/:replyId/report', forumController.reportReply);

// Nested replies (replies to replies)
router.post('/replies/:replyId/replies', 
  validationMiddleware(createReplySchema),
  forumController.createNestedReply
);

router.get('/replies/:replyId/replies', forumController.getNestedReplies);

// Best answers and solutions
router.post('/replies/:replyId/mark-as-solution', forumController.markAsSolution);
router.delete('/replies/:replyId/unmark-as-solution', forumController.unmarkAsSolution);

// User activity
router.get('/users/:userId/discussions', forumController.getUserDiscussions);
router.get('/users/:userId/replies', forumController.getUserReplies);
router.get('/my/discussions', forumController.getMyDiscussions);
router.get('/my/replies', forumController.getMyReplies);
router.get('/my/activity', forumController.getMyActivity);

// Q&A specific features
router.get('/questions', forumController.getQuestions);
router.get('/questions/unanswered', forumController.getUnansweredQuestions);
router.get('/questions/solved', forumController.getSolvedQuestions);
router.post('/questions/:questionId/close', forumController.closeQuestion);
router.post('/questions/:questionId/reopen', forumController.reopenQuestion);

// Study groups discussions
router.get('/study-groups/:groupId/discussions', forumController.getStudyGroupDiscussions);
router.post('/study-groups/:groupId/discussions', forumController.createStudyGroupDiscussion);

// School-specific discussions
router.get('/schools/:schoolId/discussions', forumController.getSchoolDiscussions);
router.post('/schools/:schoolId/discussions', forumController.createSchoolDiscussion);

// Moderation features
router.post('/discussions/:discussionId/pin', forumController.pinDiscussion);
router.delete('/discussions/:discussionId/pin', forumController.unpinDiscussion);

router.post('/discussions/:discussionId/lock', forumController.lockDiscussion);
router.delete('/discussions/:discussionId/lock', forumController.unlockDiscussion);

router.post('/discussions/:discussionId/feature', forumController.featureDiscussion);
router.delete('/discussions/:discussionId/feature', forumController.unfeatureDiscussion);

// Statistics and analytics
router.get('/stats/overview', forumController.getForumStats);
router.get('/stats/user/:userId', forumController.getUserStats);
router.get('/stats/trending-topics', forumController.getTrendingTopics);

// Notifications
router.get('/notifications', forumController.getForumNotifications);
router.put('/notifications/:notificationId/read', forumController.markNotificationAsRead);

// Polls and voting
router.post('/discussions/:discussionId/polls', forumController.createPoll);
router.post('/polls/:pollId/vote', forumController.votePoll);
router.get('/polls/:pollId/results', forumController.getPollResults);

export default router;
