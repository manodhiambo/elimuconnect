import { authMiddleware } from "./../middleware";
import { Router } from 'express';
import { ForumController } from '../controllers/forum.controller';
import { validationMiddleware, validate, validateQuery, validateParams, validateMultiple } from '../middleware/validation.middleware';
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
  validateQuery(discussionSearchSchema),
  forumController.getAllDiscussions
);

router.get('/discussions/search', 
  validateQuery(discussionSearchSchema),
  forumController.searchDiscussions
);

router.get('/discussions/trending', forumController.getTrendingDiscussions);
router.get('/discussions/recent', forumController.getRecentDiscussions);
router.get('/discussions/featured', forumController.getFeaturedDiscussions);

router.get('/discussions/:discussionId', 
  validateParams(discussionIdSchema),
  forumController.getDiscussionById
);

router.get('/discussions/:discussionId/replies', 
  validateParams(discussionIdSchema),
  forumController.getDiscussionReplies
);

// Categories and tags
router.get('/categories', forumController.getAllCategories);

router.get('/categories/:categoryId/discussions', 
  validateParams(categoryIdSchema),
  forumController.getDiscussionsByCategory
);

router.get('/tags', forumController.getAllTags);

router.get('/tags/:tag/discussions', 
  validateParams(tagSchema),
  forumController.getDiscussionsByTag
);

// Subject-specific forums
router.get('/subjects', forumController.getAllSubjects);

router.get('/subjects/:subject/discussions', 
  validateParams(subjectSchema),
  forumController.getDiscussionsBySubject
);

// Protected routes
router.use(authMiddleware);

// Discussion management
router.post('/discussions', 
  validate(createDiscussionSchema),
  uploadMiddleware.array('attachments', 5),
  forumController.createDiscussion
);

router.put('/discussions/:discussionId', 
  validateMultiple({
    params: discussionIdSchema,
    body: updateDiscussionSchema
  }),
  forumController.updateDiscussion
);

router.delete('/discussions/:discussionId', 
  validateParams(discussionIdSchema),
  forumController.deleteDiscussion
);

// Discussion interactions
router.post('/discussions/:discussionId/like', 
  validateParams(discussionIdSchema),
  forumController.likeDiscussion
);

router.delete('/discussions/:discussionId/like', 
  validateParams(discussionIdSchema),
  forumController.unlikeDiscussion
);

router.post('/discussions/:discussionId/bookmark', 
  validateParams(discussionIdSchema),
  forumController.bookmarkDiscussion
);

router.delete('/discussions/:discussionId/bookmark', 
  validateParams(discussionIdSchema),
  forumController.unbookmarkDiscussion
);

router.get('/bookmarks', forumController.getBookmarkedDiscussions);

router.post('/discussions/:discussionId/follow', 
  validateParams(discussionIdSchema),
  forumController.followDiscussion
);

router.delete('/discussions/:discussionId/follow', 
  validateParams(discussionIdSchema),
  forumController.unfollowDiscussion
);

router.get('/followed', forumController.getFollowedDiscussions);

router.post('/discussions/:discussionId/report', 
  validateMultiple({
    params: discussionIdSchema,
    body: reportSchema
  }),
  forumController.reportDiscussion
);

// Replies management
router.post('/discussions/:discussionId/replies', 
  validateMultiple({
    params: discussionIdSchema,
    body: createReplySchema
  }),
  uploadMiddleware.array('attachments', 3),
  forumController.createReply
);

router.put('/replies/:replyId', 
  validateMultiple({
    params: replyIdSchema,
    body: updateReplySchema
  }),
  forumController.updateReply
);

router.delete('/replies/:replyId', 
  validateParams(replyIdSchema),
  forumController.deleteReply
);

// Reply interactions
router.post('/replies/:replyId/like', 
  validateParams(replyIdSchema),
  forumController.likeReply
);

router.delete('/replies/:replyId/like', 
  validateParams(replyIdSchema),
  forumController.unlikeReply
);

router.post('/replies/:replyId/report', 
  validateMultiple({
    params: replyIdSchema,
    body: reportSchema
  }),
  forumController.reportReply
);

// Nested replies (replies to replies)
router.post('/replies/:replyId/replies', 
  validateMultiple({
    params: replyIdSchema,
    body: createReplySchema
  }),
  forumController.createNestedReply
);

router.get('/replies/:replyId/replies', 
  validateParams(replyIdSchema),
  forumController.getNestedReplies
);

// Best answers and solutions
router.post('/replies/:replyId/mark-as-solution', 
  validateParams(replyIdSchema),
  forumController.markAsSolution
);

router.delete('/replies/:replyId/unmark-as-solution', 
  validateParams(replyIdSchema),
  forumController.unmarkAsSolution
);

// User activity
router.get('/users/:userId/discussions', 
  validateParams(userIdSchema),
  forumController.getUserDiscussions
);

router.get('/users/:userId/replies', 
  validateParams(userIdSchema),
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
  validateMultiple({
    params: discussionIdSchema,
    body: moderationActionSchema
  }),
  forumController.closeQuestion
);

router.post('/questions/:questionId/reopen', 
  validateParams(discussionIdSchema),
  forumController.reopenQuestion
);

// Study groups discussions
router.get('/study-groups/:groupId/discussions', 
  validateParams(studyGroupIdSchema),
  forumController.getStudyGroupDiscussions
);

router.post('/study-groups/:groupId/discussions', 
  validateMultiple({
    params: studyGroupIdSchema,
    body: createDiscussionSchema
  }),
  forumController.createStudyGroupDiscussion
);

// School-specific discussions
router.get('/schools/:schoolId/discussions', 
  validateParams(schoolIdSchema),
  forumController.getSchoolDiscussions
);

router.post('/schools/:schoolId/discussions', 
  validateMultiple({
    params: schoolIdSchema,
    body: createDiscussionSchema
  }),
  forumController.createSchoolDiscussion
);

// Moderation features (require additional permission checks in controller)
router.post('/discussions/:discussionId/pin', 
  validateParams(discussionIdSchema),
  forumController.pinDiscussion
);

router.delete('/discussions/:discussionId/pin', 
  validateParams(discussionIdSchema),
  forumController.unpinDiscussion
);

router.post('/discussions/:discussionId/lock', 
  validateMultiple({
    params: discussionIdSchema,
    body: moderationActionSchema
  }),
  forumController.lockDiscussion
);

router.delete('/discussions/:discussionId/lock', 
  validateParams(discussionIdSchema),
  forumController.unlockDiscussion
);

router.post('/discussions/:discussionId/feature', 
  validateParams(discussionIdSchema),
  forumController.featureDiscussion
);

router.delete('/discussions/:discussionId/feature', 
  validateParams(discussionIdSchema),
  forumController.unfeatureDiscussion
);

// Statistics and analytics
router.get('/stats/overview', forumController.getForumStats);

router.get('/stats/user/:userId', 
  validateParams(userIdSchema),
  forumController.getUserStats
);

router.get('/stats/trending-topics', forumController.getTrendingTopics);

// Notifications
router.get('/notifications', forumController.getForumNotifications);

router.put('/notifications/:notificationId/read', 
  validateParams(notificationIdSchema),
  forumController.markNotificationAsRead
);

// Polls and voting
router.post('/discussions/:discussionId/polls', 
  validateMultiple({
    params: discussionIdSchema,
    body: createPollSchema
  }),
  forumController.createPoll
);

router.post('/polls/:pollId/vote', 
  validateMultiple({
    params: pollIdSchema,
    body: votePollSchema
  }),
  forumController.votePoll
);

router.get('/polls/:pollId/results', 
  validateParams(pollIdSchema),
  forumController.getPollResults
);

export default router;
