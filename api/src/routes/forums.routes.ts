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
  discussionSearchSchema,
  reportSchema,
  createPollSchema,
  votePollSchema,
  moderationActionSchema,
  discussionIdSchema,
  replyIdSchema,
  userIdSchema,
  categoryIdSchema,
  tagSchema,
  subjectSchema,
  schoolIdSchema,
  studyGroupIdSchema,
  pollIdSchema,
  notificationIdSchema
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

router.get('/discussions/:discussionId', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.getDiscussionById
);

router.get('/discussions/:discussionId/replies', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.getDiscussionReplies
);

// Categories and tags
router.get('/categories', forumController.getAllCategories);

router.get('/categories/:categoryId/discussions', 
  validationMiddleware(categoryIdSchema, 'params'),
  forumController.getDiscussionsByCategory
);

router.get('/tags', forumController.getAllTags);

router.get('/tags/:tag/discussions', 
  validationMiddleware(tagSchema, 'params'),
  forumController.getDiscussionsByTag
);

// Subject-specific forums
router.get('/subjects', forumController.getAllSubjects);

router.get('/subjects/:subject/discussions', 
  validationMiddleware(subjectSchema, 'params'),
  forumController.getDiscussionsBySubject
);

// Protected routes
router.use(authMiddleware);

// Discussion management
router.post('/discussions', 
  validationMiddleware(createDiscussionSchema),
  uploadMiddleware.array('attachments', 5),
  forumController.createDiscussion
);

router.put('/discussions/:discussionId', 
  validationMiddleware([...discussionIdSchema, ...updateDiscussionSchema]),
  forumController.updateDiscussion
);

router.delete('/discussions/:discussionId', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.deleteDiscussion
);

// Discussion interactions
router.post('/discussions/:discussionId/like', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.likeDiscussion
);

router.delete('/discussions/:discussionId/like', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.unlikeDiscussion
);

router.post('/discussions/:discussionId/bookmark', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.bookmarkDiscussion
);

router.delete('/discussions/:discussionId/bookmark', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.unbookmarkDiscussion
);

router.get('/bookmarks', forumController.getBookmarkedDiscussions);

router.post('/discussions/:discussionId/follow', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.followDiscussion
);

router.delete('/discussions/:discussionId/follow', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.unfollowDiscussion
);

router.get('/followed', forumController.getFollowedDiscussions);

router.post('/discussions/:discussionId/report', 
  validationMiddleware([...discussionIdSchema, ...reportSchema]),
  forumController.reportDiscussion
);

// Replies management
router.post('/discussions/:discussionId/replies', 
  validationMiddleware([...discussionIdSchema, ...createReplySchema]),
  uploadMiddleware.array('attachments', 3),
  forumController.createReply
);

router.put('/replies/:replyId', 
  validationMiddleware([...replyIdSchema, ...updateReplySchema]),
  forumController.updateReply
);

router.delete('/replies/:replyId', 
  validationMiddleware(replyIdSchema, 'params'),
  forumController.deleteReply
);

// Reply interactions
router.post('/replies/:replyId/like', 
  validationMiddleware(replyIdSchema, 'params'),
  forumController.likeReply
);

router.delete('/replies/:replyId/like', 
  validationMiddleware(replyIdSchema, 'params'),
  forumController.unlikeReply
);

router.post('/replies/:replyId/report', 
  validationMiddleware([...replyIdSchema, ...reportSchema]),
  forumController.reportReply
);

// Nested replies (replies to replies)
router.post('/replies/:replyId/replies', 
  validationMiddleware([...replyIdSchema, ...createReplySchema]),
  forumController.createNestedReply
);

router.get('/replies/:replyId/replies', 
  validationMiddleware(replyIdSchema, 'params'),
  forumController.getNestedReplies
);

// Best answers and solutions
router.post('/replies/:replyId/mark-as-solution', 
  validationMiddleware(replyIdSchema, 'params'),
  forumController.markAsSolution
);

router.delete('/replies/:replyId/unmark-as-solution', 
  validationMiddleware(replyIdSchema, 'params'),
  forumController.unmarkAsSolution
);

// User activity
router.get('/users/:userId/discussions', 
  validationMiddleware(userIdSchema, 'params'),
  forumController.getUserDiscussions
);

router.get('/users/:userId/replies', 
  validationMiddleware(userIdSchema, 'params'),
  forumController.getUserReplies
);

router.get('/my/discussions', forumController.getMyDiscussions);
router.get('/my/replies', forumController.getMyReplies);
router.get('/my/activity', forumController.getMyActivity);

// Q&A specific features
router.get('/questions', forumController.getQuestions);
router.get('/questions/unanswered', forumController.getUnansweredQuestions);
router.get('/questions/solved', forumController.getSolvedQuestions);

router.post('/questions/:questionId/close', 
  validationMiddleware([...discussionIdSchema, ...moderationActionSchema]),
  forumController.closeQuestion
);

router.post('/questions/:questionId/reopen', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.reopenQuestion
);

// Study groups discussions
router.get('/study-groups/:groupId/discussions', 
  validationMiddleware(studyGroupIdSchema, 'params'),
  forumController.getStudyGroupDiscussions
);

router.post('/study-groups/:groupId/discussions', 
  validationMiddleware([...studyGroupIdSchema, ...createDiscussionSchema]),
  forumController.createStudyGroupDiscussion
);

// School-specific discussions
router.get('/schools/:schoolId/discussions', 
  validationMiddleware(schoolIdSchema, 'params'),
  forumController.getSchoolDiscussions
);

router.post('/schools/:schoolId/discussions', 
  validationMiddleware([...schoolIdSchema, ...createDiscussionSchema]),
  forumController.createSchoolDiscussion
);

// Moderation features (require additional permission checks in controller)
router.post('/discussions/:discussionId/pin', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.pinDiscussion
);

router.delete('/discussions/:discussionId/pin', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.unpinDiscussion
);

router.post('/discussions/:discussionId/lock', 
  validationMiddleware([...discussionIdSchema, ...moderationActionSchema]),
  forumController.lockDiscussion
);

router.delete('/discussions/:discussionId/lock', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.unlockDiscussion
);

router.post('/discussions/:discussionId/feature', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.featureDiscussion
);

router.delete('/discussions/:discussionId/feature', 
  validationMiddleware(discussionIdSchema, 'params'),
  forumController.unfeatureDiscussion
);

// Statistics and analytics
router.get('/stats/overview', forumController.getForumStats);

router.get('/stats/user/:userId', 
  validationMiddleware(userIdSchema, 'params'),
  forumController.getUserStats
);

router.get('/stats/trending-topics', forumController.getTrendingTopics);

// Notifications
router.get('/notifications', forumController.getForumNotifications);

router.put('/notifications/:notificationId/read', 
  validationMiddleware(notificationIdSchema, 'params'),
  forumController.markNotificationAsRead
);

// Polls and voting
router.post('/discussions/:discussionId/polls', 
  validationMiddleware([...discussionIdSchema, ...createPollSchema]),
  forumController.createPoll
);

router.post('/polls/:pollId/vote', 
  validationMiddleware([...pollIdSchema, ...votePollSchema]),
  forumController.votePoll
);

router.get('/polls/:pollId/results', 
  validationMiddleware(pollIdSchema, 'params'),
  forumController.getPollResults
);

export default router;
