import { Request, Response } from 'express';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import ApiResponse from '../utils/ApiResponse';
import { 
  Discussion, Reply, Category, Tag, Subject, Poll, Vote,
  Bookmark, Follow, Report, Notification, Like, User
} from '../models';
import { Op } from 'sequelize';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    schoolId?: string;
  };
}

export class ForumController {
  // Discussion Management
  getAllDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, category, tag, subject, schoolId, sortBy = 'createdAt', sortOrder = 'desc', type, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = {};
    
    if (category) whereClause.categoryId = category;
    if (tag) whereClause.tags = { [Op.contains]: [tag] };
    if (subject) whereClause.subject = subject;
    if (schoolId) whereClause.schoolId = schoolId;
    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const discussions = await Discussion.findAndCountAll({
      where: whereClause,
      include: [
        { model: Reply, as: 'replies', attributes: ['id'], separate: true },
        { model: Like, as: 'likes', attributes: ['id'], separate: true }
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count, hasNext: Number(page) < totalPages, hasPrev: Number(page) > 1 }
    }, 'Discussions retrieved successfully'));
  });

  searchDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { q, page = 1, limit = 20, category, subject, dateFrom, dateTo, author } = req.query;
    if (!q) throw new AppError('Search query is required', 400);

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = {
      [Op.or]: [
        { title: { [Op.iLike]: `%${q}%` } },
        { content: { [Op.iLike]: `%${q}%` } },
        { tags: { [Op.contains]: [q] } }
      ]
    };

    if (category) whereClause.categoryId = category;
    if (subject) whereClause.subject = subject;
    if (dateFrom) whereClause.createdAt = { [Op.gte]: new Date(dateFrom as string) };
    if (dateTo) whereClause.createdAt = { ...whereClause.createdAt, [Op.lte]: new Date(dateTo as string) };
    if (author) whereClause.authorId = author;

    const discussions = await Discussion.findAndCountAll({
      where: whereClause,
      include: [{ model: Reply, as: 'replies', attributes: ['id'] }],
      order: [['createdAt', 'desc']], limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows, searchQuery: q,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'Search completed successfully'));
  });

  getTrendingDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const discussions = await Discussion.findAll({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      include: [
        { model: Reply, as: 'replies', attributes: ['id'] },
        { model: Like, as: 'likes', attributes: ['id'] }
      ],
      order: [['replyCount', 'DESC'], ['likeCount', 'DESC']],
      limit: Number(limit)
    });

    res.status(200).json(new ApiResponse(200, discussions, 'Trending discussions retrieved successfully'));
  });

  getRecentDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { limit = 20 } = req.query;
    const discussions = await Discussion.findAll({
      order: [['createdAt', 'desc']], limit: Number(limit),
      include: [{ model: Reply, as: 'replies', attributes: ['id'] }]
    });
    res.status(200).json(new ApiResponse(200, discussions, 'Recent discussions retrieved successfully'));
  });

  getFeaturedDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;
    const discussions = await Discussion.findAll({
      where: { isFeatured: true }, order: [['featuredAt', 'desc']], limit: Number(limit),
      include: [{ model: Reply, as: 'replies', attributes: ['id'] }]
    });
    res.status(200).json(new ApiResponse(200, discussions, 'Featured discussions retrieved successfully'));
  });

  getDiscussionById = catchAsync(async (req: Request, res: Response) => {
    const { discussionId } = req.params;
    const discussion = await Discussion.findByPk(discussionId, {
      include: [{ model: Reply, as: 'replies' }, { model: Like, as: 'likes' }]
    });
    if (!discussion) throw new AppError('Discussion not found', 404);
    await discussion.increment('viewCount');
    res.status(200).json(new ApiResponse(200, discussion, 'Discussion retrieved successfully'));
  });

  createDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { title, content, categoryId, tags, subject, type = 'general', schoolId, studyGroupId, isAnonymous = false } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError('User not authenticated', 401);

    let attachments: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer, { folder: 'forum/discussions', resource_type: 'auto' });
        attachments.push({
          id: uploadResult.public_id, filename: uploadResult.public_id, originalName: file.originalname,
          size: file.size, mimetype: file.mimetype, url: uploadResult.secure_url
        });
      }
    }

    const discussion = await Discussion.create({
      title, content, authorId: userId, categoryId, tags: tags || [], subject, type,
      schoolId: schoolId || req.user?.schoolId, studyGroupId, isAnonymous, attachments, status: 'active'
    });

    res.status(201).json(new ApiResponse(201, discussion, 'Discussion created successfully'));
  });

  updateDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const { title, content, categoryId, tags, subject } = req.body;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    if (discussion.authorId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You are not authorized to update this discussion', 403);
    }

    await discussion.update({
      title: title || discussion.title, content: content || discussion.content,
      categoryId: categoryId || discussion.categoryId, tags: tags || discussion.tags,
      subject: subject || discussion.subject, updatedAt: new Date()
    });

    res.status(200).json(new ApiResponse(200, discussion, 'Discussion updated successfully'));
  });

  deleteDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    if (discussion.authorId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You are not authorized to delete this discussion', 403);
    }

    if (discussion.attachments && discussion.attachments.length > 0) {
      for (const attachment of discussion.attachments) {
        if (attachment.publicId) await deleteFromCloudinary(attachment.publicId);
      }
    }

    await discussion.destroy();
    res.status(200).json(new ApiResponse(200, null, 'Discussion deleted successfully'));
  });

  // Discussion Interactions
  likeDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    const existingLike = await Like.findOne({ where: { userId, discussionId } });
    if (existingLike) throw new AppError('Discussion already liked', 400);

    await Like.create({ userId, discussionId, replyId: null });
    await discussion.increment('likeCount');
    res.status(200).json(new ApiResponse(200, null, 'Discussion liked successfully'));
  });

  unlikeDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    const like = await Like.findOne({ where: { userId, discussionId } });
    if (!like) throw new AppError('Like not found', 404);

    await like.destroy();
    const discussion = await Discussion.findByPk(discussionId);
    if (discussion) await discussion.decrement('likeCount');
    res.status(200).json(new ApiResponse(200, null, 'Discussion unliked successfully'));
  });

  bookmarkDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    const existingBookmark = await Bookmark.findOne({ where: { userId, discussionId } });
    if (existingBookmark) throw new AppError('Discussion already bookmarked', 400);

    await Bookmark.create({ userId, discussionId });
    res.status(200).json(new ApiResponse(200, null, 'Discussion bookmarked successfully'));
  });

  unbookmarkDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    const bookmark = await Bookmark.findOne({ where: { userId, discussionId } });
    if (!bookmark) throw new AppError('Bookmark not found', 404);

    await (bookmark as any).destroy();
    res.status(200).json(new ApiResponse(200, null, 'Discussion unbookmarked successfully'));
  });

  getBookmarkedDiscussions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const bookmarks = await Bookmark.findAndCountAll({
      where: { userId }, include: [{ model: Discussion, as: 'discussion' }],
      order: [['createdAt', 'desc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(bookmarks.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      bookmarks: bookmarks.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: bookmarks.count }
    }, 'Bookmarked discussions retrieved successfully'));
  });

  followDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    const existingFollow = await Follow.findOne({ where: { userId, discussionId } });
    if (existingFollow) throw new AppError('Discussion already followed', 400);

    await Follow.create({ userId, discussionId });
    res.status(200).json(new ApiResponse(200, null, 'Discussion followed successfully'));
  });

  unfollowDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    const follow = await Follow.findOne({ where: { userId, discussionId } });
    if (!follow) throw new AppError('Follow not found', 404);

    await follow.destroy();
    res.status(200).json(new ApiResponse(200, null, 'Discussion unfollowed successfully'));
  });

  getFollowedDiscussions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const follows = await Follow.findAndCountAll({
      where: { userId },
      include: [{ model: Discussion, as: 'discussion', include: [{ model: Reply, as: 'replies', attributes: ['id'] }] }],
      order: [['createdAt', 'desc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(follows.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: follows.rows.map((follow: any) => follow.discussion),
      pagination: { currentPage: Number(page), totalPages, totalCount: follows.count }
    }, 'Followed discussions retrieved successfully'));
  });

  reportDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    const existingReport = await Report.findOne({ where: { userId, discussionId } });
    if (existingReport) throw new AppError('Discussion already reported by you', 400);

    await Report.create({ userId, discussionId, reason, description, status: 'pending' });
    res.status(200).json(new ApiResponse(200, null, 'Discussion reported successfully'));
  });

  // Categories and Tags
  getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const categories = await Category.findAll({
      include: [{ model: Discussion, as: 'discussions', attributes: ['id'], separate: true }],
      order: [['name', 'asc']]
    });
    res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
  });

  getDiscussionsByCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const discussions = await Discussion.findAndCountAll({
      where: { categoryId },
      include: [
        { model: Reply, as: 'replies', attributes: ['id'] },
        { model: Category, as: 'category' }
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'Category discussions retrieved successfully'));
  });

  getAllTags = catchAsync(async (req: Request, res: Response) => {
    const discussions = await Discussion.findAll({
      attributes: ['tags'], where: { tags: { [Op.ne]: null } }
    });

    const allTags = new Set();
    discussions.forEach((discussion: any) => {
      if (discussion.tags && Array.isArray(discussion.tags)) {
        discussion.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    const tags = Array.from(allTags).map(tag => ({
      name: tag,
      count: discussions.filter((d: any) => d.tags?.includes(tag as string)).length
    }));

    res.status(200).json(new ApiResponse(200, tags, 'Tags retrieved successfully'));
  });

  getDiscussionsByTag = catchAsync(async (req: Request, res: Response) => {
    const { tag } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const discussions = await Discussion.findAndCountAll({
      where: { tags: { [Op.contains]: [tag] } },
      include: [{ model: Reply, as: 'replies', attributes: ['id'] }],
      order: [['createdAt', 'desc']], limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows, tag,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'Tag discussions retrieved successfully'));
  });

  // Subject-specific forums
  getAllSubjects = catchAsync(async (req: Request, res: Response) => {
    const subjects = await Subject.findAll({
      include: [{ model: Discussion, as: 'discussions', attributes: ['id'], separate: true }],
      order: [['name', 'asc']]
    });
    res.status(200).json(new ApiResponse(200, subjects, 'Subjects retrieved successfully'));
  });

  getDiscussionsBySubject = catchAsync(async (req: Request, res: Response) => {
    const { subject } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const discussions = await Discussion.findAndCountAll({
      where: { subject }, include: [{ model: Reply, as: 'replies', attributes: ['id'] }],
      order: [['createdAt', 'desc']], limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows, subject,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'Subject discussions retrieved successfully'));
  });

  // Discussion Replies
  getDiscussionReplies = catchAsync(async (req: Request, res: Response) => {
    const { discussionId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'asc' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const replies = await Reply.findAndCountAll({
      where: { discussionId, parentReplyId: null },
      include: [
        { model: Reply, as: 'nestedReplies' },
        { model: Like, as: 'likes', attributes: ['id'] }
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(replies.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      replies: replies.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: replies.count }
    }, 'Discussion replies retrieved successfully'));
  });

  // Replies Management  
  createReply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const { content, isAnonymous = false } = req.body;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);
    if (discussion.status === 'locked') throw new AppError('Cannot reply to locked discussion', 403);

    let attachments: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer, { folder: 'forum/replies', resource_type: 'auto' });
        attachments.push({
          url: uploadResult.secure_url, publicId: uploadResult.public_id,
          type: file.mimetype, name: file.originalname, size: file.size
        });
      }
    }

    const reply = await Reply.create({ content, authorId: userId, discussionId, isAnonymous, attachments });
    await discussion.increment('replyCount');

    const followers = await Follow.findAll({ where: { discussionId }, attributes: ['userId'] });
    for (const follow of followers) {
      if (follow.userId !== userId) {
        await Notification.create({
          userId: follow.userId, type: 'reply', title: 'New reply on followed discussion',
          message: `${req.user?.email} replied to "${discussion.title}"`,
          relatedId: discussionId, relatedType: 'discussion', isRead: false
        });
      }
    }

    res.status(201).json(new ApiResponse(201, reply, 'Reply created successfully'));
  });

  updateReply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const reply = await Reply.findByPk(replyId);
    if (!reply) throw new AppError('Reply not found', 404);

    if (reply.authorId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You are not authorized to update this reply', 403);
    }

    await reply.update({ content: content || reply.content, updatedAt: new Date() });
    res.status(200).json(new ApiResponse(200, reply, 'Reply updated successfully'));
  });

  deleteReply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const userId = req.user?.id;

    const reply = await Reply.findByPk(replyId);
    if (!reply) throw new AppError('Reply not found', 404);

    if (reply.authorId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You are not authorized to delete this reply', 403);
    }

    if (reply.attachments && reply.attachments.length > 0) {
      for (const attachment of reply.attachments) {
        if (attachment.publicId) await deleteFromCloudinary(attachment.publicId);
      }
    }

    await reply.destroy();
    const discussion = await Discussion.findByPk(reply.discussionId);
    if (discussion) await discussion.decrement('replyCount');
    res.status(200).json(new ApiResponse(200, null, 'Reply deleted successfully'));
  });

  // Reply Interactions
  likeReply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const userId = req.user?.id;

    const reply = await Reply.findByPk(replyId);
    if (!reply) throw new AppError('Reply not found', 404);

    const existingLike = await Like.findOne({ where: { userId, replyId } });
    if (existingLike) throw new AppError('Reply already liked', 400);

    await Like.create({ userId, replyId, discussionId: null });
    await reply.increment('likeCount');
    res.status(200).json(new ApiResponse(200, null, 'Reply liked successfully'));
  });

  unlikeReply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const userId = req.user?.id;

    const like = await Like.findOne({ where: { userId, replyId } });
    if (!like) throw new AppError('Like not found', 404);

    await like.destroy();
    const reply = await Reply.findByPk(replyId);
    if (reply) await reply.decrement('likeCount');
    res.status(200).json(new ApiResponse(200, null, 'Reply unliked successfully'));
  });

  reportReply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const { reason, description } = req.body;
    const userId = req.user?.id;

    const reply = await Reply.findByPk(replyId);
    if (!reply) throw new AppError('Reply not found', 404);

    const existingReport = await Report.findOne({ where: { userId, replyId } });
    if (existingReport) throw new AppError('Reply already reported by you', 400);

    await Report.create({ userId, replyId, reason, description, status: 'pending' });
    res.status(200).json(new ApiResponse(200, null, 'Reply reported successfully'));
  });

  // Nested Replies
  createNestedReply = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const { content, isAnonymous = false } = req.body;
    const userId = req.user?.id;

    const parentReply = await Reply.findByPk(replyId, { include: [{ model: Discussion, as: 'discussion' }] });
    if (!parentReply) throw new AppError('Parent reply not found', 404);
    if (parentReply.discussion.status === 'locked') throw new AppError('Cannot reply to locked discussion', 403);

    const nestedReply = await Reply.create({
      content, authorId: userId, discussionId: parentReply.discussionId, parentReplyId: replyId, isAnonymous
    });

    await Discussion.increment('replyCount', { where: { id: parentReply.discussionId } });

    if (parentReply.authorId !== userId) {
      await Notification.create({
        userId: parentReply.authorId, type: 'nested_reply', title: 'Someone replied to your comment',
        message: `${req.user?.email} replied to your comment`, relatedId: parentReply.discussionId,
        relatedType: 'discussion', isRead: false
      });
    }

    res.status(201).json(new ApiResponse(201, nestedReply, 'Nested reply created successfully'));
  });

  getNestedReplies = catchAsync(async (req: Request, res: Response) => {
    const { replyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const nestedReplies = await Reply.findAndCountAll({
      where: { parentReplyId: replyId },
      include: [{ model: Like, as: 'likes', attributes: ['id'] }],
      order: [['createdAt', 'asc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(nestedReplies.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      replies: nestedReplies.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: nestedReplies.count }
    }, 'Nested replies retrieved successfully'));
  });

  // Best Answers and Solutions
  markAsSolution = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const userId = req.user?.id;

    const reply = await Reply.findByPk(replyId, { include: [{ model: Discussion, as: 'discussion' }] });
    if (!reply) throw new AppError('Reply not found', 404);
    if (reply.discussion.authorId !== userId) throw new AppError('Only discussion author ark solutions', 403);

    await Reply.update({ isSolution: false }, { where: { discussionId: reply.discussionId } });
    await reply.update({ isSolution: true });
    await reply.discussion.update({ status: 'solved', solvedAt: new Date() });

    if (reply.authorId !== userId) {
      await Notification.create({
        userId: reply.authorId, type: 'solution_marked', title: 'Your answer was marked as solution',
        message: `Your answer to "${reply.discussion.title}" was marked as the solution`,
       relatedId: reply.discussionId, relatedType: 'discussion', isRead: false
      });
    }

    res.status(200).json(new ApiResponse(200, reply, 'Reply marked as solution successfully'));
  });

  unmarkAsSolution = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { replyId } = req.params;
    const userId = req.user?.id;

    const reply = await Reply.findByPk(replyId, { include: [{ model: Discussion, as: 'discussion' }] });
    if (!reply) throw new AppError('Reply not found', 404);
    if (reply.discussion.authorId !== userId) throw new AppError('Only discussion author can unmark solutions', 403);

    await reply.update({ isSolution: false });
    await reply.discussion.update({ status: 'active', solvedAt: null });
    res.status(200).json(new ApiResponse(200, reply, 'Solution unmarked successfully'));
  });

  // User Activity
  getUserDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const discussions = await Discussion.findAndCountAll({
      where: { authorId: userId },
      include: [
        { model: Reply, as: 'replies', attributes: ['id'] },
        { model: Category, as: 'category' }
      ],
      order: [['createdAt', 'desc']], limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'User discussions retrieved successfully'));
  });

  getUserReplies = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const replies = await Reply.findAndCountAll({
      where: { authorId: userId },
      include: [{ model: Discussion, as: 'discussion', attributes: ['id', 'title', 'slug'] }],
      order: [['createdAt', 'desc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(replies.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      replies: replies.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: replies.count }
    }, 'User replies retrieved successfully'));
  });

  getMyDiscussions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { authorId: userId };
    if (status) whereClause.status = status;

    const discussions = await Discussion.findAndCountAll({
      where: whereClause,
      include: [
        { model: Reply, as: 'replies', attributes: ['id'] },
        { model: Like, as: 'likes', attributes: ['id'] }
      ],
      order: [['createdAt', 'desc']], limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'My discussions retrieved successfully'));
  });

  getMyReplies = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const replies = await Reply.findAndCountAll({
      where: { authorId: userId },
      include: [
        { model: Discussion, as: 'discussion', attributes: ['id', 'title', 'slug', 'status'] },
        { model: Like, as: 'likes', attributes: ['id'] }
      ],
      order: [['createdAt', 'desc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(replies.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      replies: replies.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: replies.count }
    }, 'My replies retrieved successfully'));
  });

  getMyActivity = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const [discussions, replies] = await Promise.all([
      Discussion.findAll({
        where: { authorId: userId }, attributes: ['id', 'title', 'createdAt', 'type'],
        limit: Number(limit) / 2, order: [['createdAt', 'desc']]
      }),
      Reply.findAll({
        where: { authorId: userId }, attributes: ['id', 'content', 'createdAt', 'discussionId'],
        include: [{ model: Discussion, as: 'discussion', attributes: ['title'] }],
        limit: Number(limit) / 2, order: [['createdAt', 'desc']]
      })
    ]);

    const activity = [
      ...discussions.map((d: any) => ({ ...d.toJSON(), activityType: 'discussion' })),
      ...replies.map((r: any) => ({ ...r.toJSON(), activityType: 'reply' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(0, Number(limit));

    res.status(200).json(new ApiResponse(200, {
      activity, pagination: { currentPage: Number(page), totalCount: activity.length }
    }, 'User activity retrieved successfully'));
  });

  // Q&A Features
  getQuestions = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20, status, subject } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { type: 'question' };
    if (status) whereClause.status = status;
    if (subject) whereClause.subject = subject;

    const questions = await Discussion.findAndCountAll({
      where: whereClause,
      include: [
        { model: Reply, as: 'replies', attributes: ['id', 'isSolution'] },
        { model: Like, as: 'likes', attributes: ['id'] }
      ],
      order: [['createdAt', 'desc']], limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(questions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      questions: questions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: questions.count }
    }, 'Questions retrieved successfully'));
  });

  getUnansweredQuestions = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const questions = await Discussion.findAndCountAll({
      where: { type: 'question', replyCount: 0, status: 'active' },
      include: [{ model: Like, as: 'likes', attributes: ['id'] }],
      order: [['createdAt', 'desc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(questions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      questions: questions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: questions.count }
    }, 'Unanswered questions retrieved successfully'));
  });

  getSolvedQuestions = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const questions = await Discussion.findAndCountAll({
      where: { type: 'question', status: 'solved' },
      include: [{ model: Reply, as: 'replies', where: { isSolution: true }, required: false }],
      order: [['solvedAt', 'desc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(questions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      questions: questions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: questions.count }
    }, 'Solved questions retrieved successfully'));
  });

  closeQuestion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    const question = await Discussion.findByPk(questionId);
    if (!question) throw new AppError('Question not found', 404);
    if (question.type !== 'question') throw new AppError('This is not a question', 400);

    if (question.authorId !== userId && req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
      throw new AppError('You are not authorized to close this question', 403);
    }

    await question.update({
      status: 'closed', closeReason: reason, closedAt: new Date(), closedBy: userId
    });

    res.status(200).json(new ApiResponse(200, question, 'Question closed successfully'));
  });

  reopenQuestion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { questionId } = req.params;
    const userId = req.user?.id;

    const question = await Discussion.findByPk(questionId);
    if (!question) throw new AppError('Question not found', 404);

    if (question.authorId !== userId && req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
      throw new AppError('You are not authorized to reopen this question', 403);
    }

    await question.update({ status: 'active', closeReason: null, closedAt: null, closedBy: null });
    res.status(200).json(new ApiResponse(200, question, 'Question reopened successfully'));
  });

  // Study Groups
  getStudyGroupDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const discussions = await Discussion.findAndCountAll({
      where: { studyGroupId: groupId },
      include: [
        { model: Reply, as: 'replies', attributes: ['id'] },
        { model: Like, as: 'likes', attributes: ['id'] }
      ],
      order: [[sortBy as string, sortOrder as string]],
      limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'Study group discussions retrieved successfully'));
  });

  createStudyGroupDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { groupId } = req.params;
    const { title, content, categoryId, tags, type = 'general' } = req.body;
    const userId = req.user?.id;

    const discussion = await Discussion.create({
      title, content, authorId: userId, categoryId, tags: tags || [],
      type, studyGroupId: groupId, status: 'active'
    });

    res.status(201).json(new ApiResponse(201, discussion, 'Study group discussion created successfully'));
  });

  // School-specific
  getSchoolDiscussions = catchAsync(async (req: Request, res: Response) => {
    const { schoolId } = req.params;
    const { page = 1, limit = 20, subject, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { schoolId };
    if (subject) whereClause.subject = subject;
    if (category) whereClause.categoryId = category;

    const discussions = await Discussion.findAndCountAll({
      where: whereClause,
      include: [
        { model: Reply, as: 'replies', attributes: ['id'] },
        { model: Category, as: 'category' }
      ],
      order: [['createdAt', 'desc']], limit: Number(limit), offset, distinct: true
    });

    const totalPages = Math.ceil(discussions.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      discussions: discussions.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: discussions.count }
    }, 'School discussions retrieved successfully'));
  });

  createSchoolDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { schoolId } = req.params;
    const { title, content, categoryId, tags, subject, type = 'general' } = req.body;
    const userId = req.user?.id;

    if (req.user?.schoolId !== schoolId) {
      throw new AppError('You can only create discussions in your own school', 403);
    }

    const discussion = await Discussion.create({
      title, content, authorId: userId, categoryId, tags: tags || [],
      subject, type, schoolId, status: 'active'
    });

    res.status(201).json(new ApiResponse(201, discussion, 'School discussion created successfully'));
  });

  // Moderation
  pinDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You do not have permission to pin discussions', 403);
    }

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    await discussion.update({ isPinned: true, pinnedAt: new Date(), pinnedBy: userId });
    res.status(200).json(new ApiResponse(200, discussion, 'Discussion pinned successfully'));
  });

  unpinDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;

    if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You do not have permission to unpin discussions', 403);
    }

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    await discussion.update({ isPinned: false, pinnedAt: null, pinnedBy: null });
    res.status(200).json(new ApiResponse(200, discussion, 'Discussion unpinned successfully'));
  });

  lockDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You do not have permission to lock discussions', 403);
    }

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    await discussion.update({
      status: 'locked', lockReason: reason, lockedAt: new Date(), lockedBy: userId
    });

    res.status(200).json(new ApiResponse(200, discussion, 'Discussion locked successfully'));
  });

  unlockDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;

    if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You do not have permission to unlock discussions', 403);
    }

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    await discussion.update({ status: 'active', lockReason: null, lockedAt: null, lockedBy: null });
    res.status(200).json(new ApiResponse(200, discussion, 'Discussion unlocked successfully'));
  });

  featureDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const userId = req.user?.id;

    if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You do not have permission to feature discussions', 403);
    }

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    await discussion.update({ isFeatured: true, featuredAt: new Date(), featuredBy: userId });
    res.status(200).json(new ApiResponse(200, discussion, 'Discussion featured successfully'));
  });

  unfeatureDiscussion = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;

    if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      throw new AppError('You do not have permission to unfeature discussions', 403);
    }

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);

    await discussion.update({ isFeatured: false, featuredAt: null, featuredBy: null });
    res.status(200).json(new ApiResponse(200, discussion, 'Discussion unfeatured successfully'));
  });

  // Statistics
  getForumStats = catchAsync(async (req: Request, res: Response) => {
    const [totalDiscussions, totalReplies, totalUsers, activeDiscussions, solvedQuestions, recentActivity] = await Promise.all([
      Discussion.count(),
      Reply.count(),
      User ? User.count() : 0,
      Discussion.count({ where: { status: 'active' } }),
      Discussion.count({ where: { type: 'question', status: 'solved' } }),
      Discussion.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
    ]);

    const stats = {
      totalDiscussions, totalReplies, totalUsers, activeDiscussions, solvedQuestions, recentActivity,
      engagementRate: totalReplies > 0 ? (totalReplies / totalDiscussions).toFixed(2) : '0'
    };

    res.status(200).json(new ApiResponse(200, stats, 'Forum statistics retrieved successfully'));
  });

  getUserStats = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const [totalDiscussions, totalReplies, totalLikes, solutionsMarked, questionsAnswered] = await Promise.all([
      Discussion.count({ where: { authorId: userId } }),
      Reply.count({ where: { authorId: userId } }),
      Like.count({ where: { userId } }),
      Reply.count({ where: { authorId: userId, isSolution: true } }),
      Discussion.count({
        where: {
          type: 'question',
          id: { [Op.in]: await Reply.findAll({
            where: { authorId: userId }, attributes: ['discussionId'], group: ['discussionId']
          }).then((replies: any[]) => replies.map(r => r.discussionId)) }
        }
      })
    ]);

    const userStats = {
      totalDiscussions, totalReplies, totalLikes, solutionsMarked, questionsAnswered,
      reputation: solutionsMarked * 10 + totalLikes * 2
    };

    res.status(200).json(new ApiResponse(200, userStats, 'User statistics retrieved successfully'));
  });

  getTrendingTopics = catchAsync(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingSubjects = await Discussion.findAll({
      attributes: [
        'subject',
        [(Discussion as any).sequelize.fn('COUNT', (Discussion as any).sequelize.col('id')), 'discussionCount'],
        [(Discussion as any).sequelize.fn('SUM', (Discussion as any).sequelize.col('replyCount')), 'totalReplies']
      ],
      where: { createdAt: { [Op.gte]: sevenDaysAgo }, subject: { [Op.ne]: null } },
      group: ['subject'],
      order: [[(Discussion as any).sequelize.literal('discussionCount + totalReplies'), 'DESC']],
      limit: Number(limit)
    });

    const discussions = await Discussion.findAll({
      attributes: ['tags'],
      where: { createdAt: { [Op.gte]: sevenDaysAgo }, tags: { [Op.ne]: null } }
    });

    const tagCounts = new Map();
    discussions.forEach((discussion: any) => {
      if (discussion.tags && Array.isArray(discussion.tags)) {
        discussion.tags.forEach((tag: string) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
      }
    });

    const trendingTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, Number(limit))
      .map(([tag, count]) => ({ tag, count }));

    const trendingTopics = { subjects: trendingSubjects, tags: trendingTags };
    res.status(200).json(new ApiResponse(200, trendingTopics, 'Trending topics retrieved successfully'));
  });

  // Notifications
  getForumNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { 
      userId,
      type: { [Op.in]: ['reply', 'nested_reply', 'solution_marked', 'discussion_liked', 'reply_liked'] }
    };

    if (unreadOnly === 'true') whereClause.isRead = false;

    const notifications = await Notification.findAndCountAll({
      where: whereClause, order: [['createdAt', 'desc']], limit: Number(limit), offset
    });

    const totalPages = Math.ceil(notifications.count / Number(limit));
    res.status(200).json(new ApiResponse(200, {
      notifications: notifications.rows,
      pagination: { currentPage: Number(page), totalPages, totalCount: notifications.count }
    }, 'Forum notifications retrieved successfully'));
  });

  markNotificationAsRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOne({ where: { id: notificationId, userId } });
    if (!notification) throw new AppError('Notification not found', 404);

    await (notification as any).update({ isRead: true, readAt: new Date() });
    res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
  });

  // Polls
  createPoll = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { discussionId } = req.params;
    const { question, options, allowMultiple = false, expiresAt } = req.body;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(discussionId);
    if (!discussion) throw new AppError('Discussion not found', 404);
    if (discussion.authorId !== userId) throw new AppError('You can only create polls in your own discussions', 403);
    if (!Array.isArray(options) || options.length < 2) throw new AppError('Poll must have at least 2 options', 400);

    const poll = await Poll.create({
      discussionId, createdBy: userId, question,
      options: options.map((option: string, index: number) => ({
        id: index + 1, text: option, votes: 0, order: index + 1
      })),
      allowMultiple, expiresAt: expiresAt ? new Date(expiresAt) : undefined, status: 'active'
    });

    res.status(201).json(new ApiResponse(201, poll, 'Poll created successfully'));
  });

  votePoll = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { pollId } = req.params;
    const { optionIds } = req.body;
    const userId = req.user?.id;

    const poll = await Poll.findByPk(pollId);
    if (!poll) throw new AppError('Poll not found', 404);
    if (poll.status !== 'active') throw new AppError('Poll is not active', 400);
    if (poll.expiresAt && new Date() > poll.expiresAt) throw new AppError('Poll has expired', 400);

    const existingVote = await Vote.findOne({ where: { userId, pollId } });
    if (existingVote) throw new AppError('You have already voted in this poll', 400);

    if (!Array.isArray(optionIds) || optionIds.length === 0) throw new AppError('You must select at least one option', 400);
    if (!poll.allowMultiple && optionIds.length > 1) throw new AppError('This poll allows only one selection', 400);

    const validOptionIds = poll.options.map((option: any) => option.id);
    const invalidOptions = optionIds.filter((id: number) => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) throw new AppError('Invalid option IDs provided', 400);

    await Vote.create({ userId, pollId, optionIds });
    const updatedOptions = poll.options.map((option: any) => {
      if (optionIds.includes(option.id)) return { ...option, votes: option.votes + 1 };
      return option;
    });

    await poll.update({ options: updatedOptions });
    await poll.increment('totalVotes');
    res.status(200).json(new ApiResponse(200, poll, 'Vote recorded successfully'));
  });

  getPollResults = catchAsync(async (req: Request, res: Response) => {
    const { pollId } = req.params;

    const poll = await Poll.findByPk(pollId, {
      include: [{ model: Vote, as: 'votes', attributes: ['userId', 'optionIds', 'createdAt'] }]
    });

    if (!poll) throw new AppError('Poll not found', 404);

    const results = {
      ...poll.toJSON(),
      statistics: {
        totalVotes: poll.totalVotes,
        participationRate: poll.totalVotes > 0 ? 
          ((poll.votes?.length || 0) / poll.totalVotes * 100).toFixed(2) + '%' : '0%',
        isExpired: poll.expiresAt ? new Date() > poll.expiresAt : false,
        timeRemaining: poll.expiresAt ? Math.max(0, poll.expiresAt.getTime() - new Date().getTime()) : null
      }
    };

    res.status(200).json(new ApiResponse(200, results, 'Poll results retrieved successfully'));
  });
}
