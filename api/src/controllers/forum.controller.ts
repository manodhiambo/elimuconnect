import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Database models - Update these paths according to your project structure
import { Discussion } from '../models/Discussion';
import { Reply } from '../models/Reply';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Tag } from '../models/Tag';
import { Poll } from '../models/Poll';
import { Bookmark } from '../models/Bookmark';
import { Like } from '../models/Like';
import { Follow } from '../models/Follow';
import { Report } from '../models/Report';
import { Notification } from '../models/Notification';

// Services - Update these paths according to your project structure
import { NotificationService } from '../services/NotificationService';
import { SearchService } from '../services/SearchService';
import { FileService } from '../services/FileService';
import { AnalyticsService } from '../services/AnalyticsService';

// Utilities
import { paginate } from '../utils/pagination';
import { generateSlug } from '../utils/slug';
import { sanitizeHtml } from '../utils/sanitizer';

// Types/Interfaces
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    isAdmin: boolean;
    isModerator: boolean;
  };
}

interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface DiscussionQuery extends PaginationQuery {
  category?: string;
  tag?: string;
  subject?: string;
  type?: 'discussion' | 'question' | 'announcement' | 'poll';
  status?: 'open' | 'closed' | 'solved';
  q?: string;
}

export class ForumController {
  // Public routes - Discussions
  async getAllDiscussions(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { 
        page = 1, 
        limit = 20, 
        category, 
        tag, 
        subject, 
        sort = 'recent',
        type,
        status,
        q 
      } = req.query as DiscussionQuery;
      
      const filters: any = {};
      
      // Build filters
      if (category) filters.categoryId = category;
      if (tag) filters.tags = { $in: [tag] };
      if (subject) filters.subject = subject;
      if (type) filters.type = type;
      if (status) filters.status = status;
      if (q) {
        filters.$or = [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ];
      }

      // Build sort options
      let sortOptions: any = {};
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { viewCount: -1, likeCount: -1 };
          break;
        case 'replies':
          sortOptions = { replyCount: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const discussions = await Discussion.findWithPagination(filters, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['author', 'category', 'tags']
      });
      
      const total = await Discussion.countDocuments(filters);
      
      res.json({
        discussions: discussions.map(d => d.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async searchDiscussions(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { q, category, tag, subject, sort = 'relevance', page = 1, limit = 20 } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const searchOptions = {
        query: q as string,
        filters: {
          category: category as string,
          tag: tag as string,
          subject: subject as string
        },
        sort: sort as string,
        page: Number(page),
        limit: Number(limit)
      };

      const results = await SearchService.searchDiscussions(searchOptions);
      
      res.json({ 
        results: results.discussions.map(d => d.toSafeObject()),
        pagination: results.pagination,
        searchMeta: {
          query: q,
          totalResults: results.total,
          searchTime: results.searchTime
        }
      });
    } catch (error) {
      console.error('Error searching discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTrendingDiscussions(req: Request, res: Response) {
    try {
      const { limit = 20, period = '7d' } = req.query;
      
      const periodDays = period === '1d' ? 1 : period === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const discussions = await Discussion.getTrending({
        since: startDate,
        limit: Number(limit)
      });
      
      res.json({ 
        discussions: discussions.map(d => d.toSafeObject()),
        period,
        generatedAt: new Date()
      });
    } catch (error) {
      console.error('Error fetching trending discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRecentDiscussions(req: Request, res: Response) {
    try {
      const { limit = 20 } = req.query;
      
      const discussions = await Discussion.findRecent({
        limit: Number(limit),
        populate: ['author', 'category']
      });
      
      res.json({ 
        discussions: discussions.map(d => d.toSafeObject())
      });
    } catch (error) {
      console.error('Error fetching recent discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getFeaturedDiscussions(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      
      const discussions = await Discussion.findFeatured({
        limit: Number(limit),
        populate: ['author', 'category']
      });
      
      res.json({ 
        discussions: discussions.map(d => d.toSafeObject())
      });
    } catch (error) {
      console.error('Error fetching featured discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDiscussionById(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id;
      
      const discussion = await Discussion.findByIdWithDetails(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Increment view count
      await Discussion.incrementViewCount(discussionId, userId);

      // Get user interactions if authenticated
      let userInteractions = null;
      if (userId) {
        userInteractions = await Discussion.getUserInteractions(discussionId, userId);
      }
      
      res.json({ 
        discussion: discussion.toSafeObject(),
        userInteractions
      });
    } catch (error) {
      console.error('Error fetching discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDiscussionReplies(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const { page = 1, limit = 20, sort = 'oldest' } = req.query;
      const userId = (req as AuthenticatedRequest).user?.id;
      
      // Verify discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      let sortOptions: any = {};
      switch (sort) {
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { likeCount: -1, createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: 1 };
      }

      const replies = await Reply.findByDiscussion(discussionId, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['author']
      });
      
      const total = await Reply.countByDiscussion(discussionId);

      // Get user interactions for each reply if authenticated
      let userInteractions = {};
      if (userId && replies.length > 0) {
        const replyIds = replies.map(r => r.id);
        userInteractions = await Reply.getUserInteractions(replyIds, userId);
      }
      
      res.json({
        replies: replies.map(r => r.toSafeObject()),
        userInteractions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching discussion replies:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Categories and Tags
  async getAllCategories(req: Request, res: Response) {
    try {
      const { includeStats = false } = req.query;
      
      const categories = await Category.findAll({
        includeStats: includeStats === 'true'
      });
      
      res.json({ 
        categories: categories.map(c => c.toSafeObject())
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
// Protected routes - Discussion management
  async createDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, category, tags, subject, type = 'discussion' } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const attachments = req.files as Express.Multer.File[];
      
      // Sanitize content
      const sanitizedContent = sanitizeHtml(content);
      
      // Generate slug from title
      const slug = generateSlug(title);
      
      // Process file attachments
      let processedAttachments: any[] = [];
      if (attachments && attachments.length > 0) {
        processedAttachments = await FileService.processAttachments(attachments);
      }

      // Create discussion
      const discussionData = {
        title,
        content: sanitizedContent,
        slug,
        authorId: userId,
        categoryId: category,
        tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
        subject,
        type,
        attachments: processedAttachments,
        status: 'open'
      };

      const discussion = await Discussion.create(discussionData);
      
      // Update tag usage counts
      if (tags && tags.length > 0) {
        await Tag.incrementUsage(tags);
      }

      // Send notifications to followers of the category/subject
      await NotificationService.notifyNewDiscussion(discussion);
      
      res.status(201).json({ 
        discussion: discussion.toSafeObject(), 
        message: 'Discussion created successfully' 
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const { title, content, tags } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      
      const discussion = await Discussion.findById(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }
      
      // Check if user owns the discussion or has admin/moderator rights
      if (discussion.authorId !== userId && !isAdmin && !isModerator) {
        return res.status(403).json({ message: 'Unauthorized to edit this discussion' });
      }

      // Prepare update data
      const updateData: any = {};
      if (title) {
        updateData.title = title;
        updateData.slug = generateSlug(title);
      }
      if (content) {
        updateData.content = sanitizeHtml(content);
      }
      if (tags) {
        updateData.tags = Array.isArray(tags) ? tags : [tags].filter(Boolean);
      }
      updateData.updatedAt = new Date();

      const updatedDiscussion = await Discussion.update(discussionId, updateData);
      
      // Update tag usage if tags changed
      if (tags) {
        await Tag.updateUsage(discussion.tags, tags);
      }
      
      res.json({ 
        discussion: updatedDiscussion.toSafeObject(), 
        message: 'Discussion updated successfully' 
      });
    } catch (error) {
      console.error('Error updating discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      
      const discussion = await Discussion.findById(discussionId);
      
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }
      
      // Check ownership or admin/moderator rights
      if (discussion.authorId !== userId && !isAdmin && !isModerator) {
        return res.status(403).json({ message: 'Unauthorized to delete this discussion' });
      }

      // Soft delete the discussion
      await Discussion.softDelete(discussionId, userId);
      
      // Clean up related data
      await Promise.all([
        Reply.deleteByDiscussion(discussionId),
        Like.deleteByTarget('discussion', discussionId),
        Bookmark.deleteByTarget('discussion', discussionId),
        Follow.deleteByDiscussion(discussionId),
        Poll.deleteByDiscussion(discussionId)
      ]);

      // Update tag usage counts
      if (discussion.tags && discussion.tags.length > 0) {
        await Tag.decrementUsage(discussion.tags);
      }
      
      res.json({ message: 'Discussion deleted successfully' });
    } catch (error) {
      console.error('Error deleting discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Discussion interactions
  async likeDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Check if already liked
      const existingLike = await Like.findByUserAndTarget(userId, 'discussion', discussionId);
      if (existingLike) {
        return res.status(400).json({ message: 'Discussion already liked' });
      }

      // Create like
      await Like.create({
        userId,
        targetType: 'discussion',
        targetId: discussionId
      });

      // Update discussion like count
      const likeCount = await Discussion.incrementLikeCount(discussionId);

      // Send notification to discussion author
      if (discussion.authorId !== userId) {
        await NotificationService.notifyDiscussionLiked(discussion, userId);
      }
      
      res.json({ 
        liked: true, 
        likeCount,
        message: 'Discussion liked successfully'
      });
    } catch (error) {
      console.error('Error liking discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unlikeDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Remove like
      const removed = await Like.remove(userId, 'discussion', discussionId);
      if (!removed) {
        return res.status(400).json({ message: 'Discussion was not liked' });
      }

      // Update discussion like count
      const likeCount = await Discussion.decrementLikeCount(discussionId);
      
      res.json({ 
        liked: false, 
        likeCount,
        message: 'Discussion unliked successfully'
      });
    } catch (error) {
      console.error('Error unliking discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async bookmarkDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Check if already bookmarked
      const existingBookmark = await Bookmark.findByUserAndTarget(userId, 'discussion', discussionId);
      if (existingBookmark) {
        return res.status(400).json({ message: 'Discussion already bookmarked' });
      }

      // Create bookmark
      await Bookmark.create({
        userId,
        targetType: 'discussion',
        targetId: discussionId
      });
      
      res.json({ 
        bookmarked: true, 
        message: 'Discussion bookmarked successfully' 
      });
    } catch (error) {
      console.error('Error bookmarking discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unbookmarkDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Remove bookmark
      const removed = await Bookmark.remove(userId, 'discussion', discussionId);
      if (!removed) {
        return res.status(400).json({ message: 'Discussion was not bookmarked' });
      }
      
      res.json({ 
        bookmarked: false, 
        message: 'Discussion unbookmarked successfully' 
      });
    } catch (error) {
      console.error('Error unbookmarking discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async followDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Check if already following
      const existingFollow = await Follow.exists(userId, discussionId);
      if (existingFollow) {
        return res.status(400).json({ message: 'Already following this discussion' });
      }

      // Create follow
      await Follow.create(userId, discussionId);
      
      res.json({ 
        following: true, 
        message: 'Now following discussion' 
      });
    } catch (error) {
      console.error('Error following discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unfollowDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Remove follow
      const removed = await Follow.delete(userId, discussionId);
      if (!removed) {
        return res.status(400).json({ message: 'Not following this discussion' });
      }
      
      res.json({ 
        following: false, 
        message: 'Unfollowed discussion' 
      });
    } catch (error) {
      console.error('Error unfollowing discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async reportDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const { reason, description } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Check if user already reported this discussion
      const existingReport = await Report.findByUserAndTarget(userId, 'discussion', discussionId);
      if (existingReport) {
        return res.status(400).json({ message: 'You have already reported this discussion' });
      }

      // Create report
      await Report.create({
        reporterId: userId,
        targetType: 'discussion',
        targetId: discussionId,
        reason,
        description,
        status: 'pending'
      });
      
      res.json({ message: 'Discussion reported successfully' });
    } catch (error) {
      console.error('Error reporting discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

// Replies management
  async createReply(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const { content, parentReplyId } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const attachments = req.files as Express.Multer.File[];
      
      // Check if discussion exists and is not locked
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }
      
      if (discussion.status === 'locked') {
        return res.status(403).json({ message: 'Discussion is locked' });
      }

      // Sanitize content
      const sanitizedContent = sanitizeHtml(content);
      
      // Process file attachments
      let processedAttachments: any[] = [];
      if (attachments && attachments.length > 0) {
        processedAttachments = await FileService.processAttachments(attachments);
      }

      // Validate parent reply if provided
      if (parentReplyId) {
        const parentReply = await Reply.findById(parentReplyId);
        if (!parentReply || parentReply.discussionId !== discussionId) {
          return res.status(400).json({ message: 'Invalid parent reply' });
        }
      }

      // Create reply
      const replyData = {
        discussionId,
        authorId: userId,
        content: sanitizedContent,
        parentReplyId: parentReplyId || null,
        attachments: processedAttachments
      };

      const reply = await Reply.create(replyData);
      
      // Update discussion reply count
      await Discussion.incrementReplyCount(discussionId);

      // Send notifications
      await NotificationService.notifyNewReply(discussion, reply);
      
      res.status(201).json({ 
        reply: reply.toSafeObject(), 
        message: 'Reply created successfully' 
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateReply(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const { content } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      
      const reply = await Reply.findById(replyId);
      
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      
      // Check ownership or admin/moderator rights
      if (reply.authorId !== userId && !isAdmin && !isModerator) {
        return res.status(403).json({ message: 'Unauthorized to edit this reply' });
      }

      const updateData = {
        content: sanitizeHtml(content),
        updatedAt: new Date(),
        isEdited: true
      };

      const updatedReply = await Reply.update(replyId, updateData);
      
      res.json({ 
        reply: updatedReply.toSafeObject(), 
        message: 'Reply updated successfully' 
      });
    } catch (error) {
      console.error('Error updating reply:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteReply(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      
      const reply = await Reply.findById(replyId);
      
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }
      
      // Check ownership or admin/moderator rights
      if (reply.authorId !== userId && !isAdmin && !isModerator) {
        return res.status(403).json({ message: 'Unauthorized to delete this reply' });
      }

      // Check if reply has nested replies
      const hasNestedReplies = await Reply.hasNestedReplies(replyId);
      if (hasNestedReplies) {
        // Soft delete to preserve thread structure
        await Reply.softDelete(replyId, userId);
      } else {
        // Hard delete if no nested replies
        await Reply.delete(replyId);
      }

      // Update discussion reply count
      await Discussion.decrementReplyCount(reply.discussionId);

      // Clean up related data
      await Promise.all([
        Like.deleteByTarget('reply', replyId),
        Report.deleteByTarget('reply', replyId)
      ]);
      
      res.json({ message: 'Reply deleted successfully' });
    } catch (error) {
      console.error('Error deleting reply:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Reply interactions
  async likeReply(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if reply exists
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      // Check if already liked
      const existingLike = await Like.findByUserAndTarget(userId, 'reply', replyId);
      if (existingLike) {
        return res.status(400).json({ message: 'Reply already liked' });
      }

      // Create like
      await Like.create({
        userId,
        targetType: 'reply',
        targetId: replyId
      });

      // Update reply like count
      const likeCount = await Reply.incrementLikeCount(replyId);

      // Send notification to reply author
      if (reply.authorId !== userId) {
        await NotificationService.notifyReplyLiked(reply, userId);
      }
      
      res.json({ 
        liked: true, 
        likeCount,
        message: 'Reply liked successfully'
      });
    } catch (error) {
      console.error('Error liking reply:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unlikeReply(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if reply exists
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      // Remove like
      const removed = await Like.remove(userId, 'reply', replyId);
      if (!removed) {
        return res.status(400).json({ message: 'Reply was not liked' });
      }

      // Update reply like count
      const likeCount = await Reply.decrementLikeCount(replyId);
      
      res.json({ 
        liked: false, 
        likeCount,
        message: 'Reply unliked successfully'
      });
    } catch (error) {
      console.error('Error unliking reply:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async reportReply(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const { reason, description } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if reply exists
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      // Check if user already reported this reply
      const existingReport = await Report.findByUserAndTarget(userId, 'reply', replyId);
      if (existingReport) {
        return res.status(400).json({ message: 'You have already reported this reply' });
      }

      // Create report
      await Report.create({
        reporterId: userId,
        targetType: 'reply',
        targetId: replyId,
        reason,
        description,
        status: 'pending'
      });
      
      res.json({ message: 'Reply reported successfully' });
    } catch (error) {
      console.error('Error reporting reply:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Nested replies
  async createNestedReply(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const { content } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if parent reply exists
      const parentReply = await Reply.findById(replyId);
      if (!parentReply) {
        return res.status(404).json({ message: 'Parent reply not found' });
      }

      // Check if discussion is not locked
      const discussion = await Discussion.findById(parentReply.discussionId);
      if (discussion?.status === 'locked') {
        return res.status(403).json({ message: 'Discussion is locked' });
      }

      // Create nested reply
      const nestedReplyData = {
        discussionId: parentReply.discussionId,
        authorId: userId,
        content: sanitizeHtml(content),
        parentReplyId: replyId
      };

      const nestedReply = await Reply.create(nestedReplyData);
      
      // Update discussion reply count
      await Discussion.incrementReplyCount(parentReply.discussionId);

      // Send notifications
      await NotificationService.notifyNestedReply(parentReply, nestedReply);
      
      res.status(201).json({ 
        reply: nestedReply.toSafeObject(),
        message: 'Nested reply created successfully' 
      });
    } catch (error) {
      console.error('Error creating nested reply:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getNestedReplies(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const { page = 1, limit = 10, sort = 'oldest' } = req.query;
      
      // Check if parent reply exists
      const parentReply = await Reply.findById(replyId);
      if (!parentReply) {
        return res.status(404).json({ message: 'Parent reply not found' });
      }

      let sortOptions: any = {};
      switch (sort) {
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { likeCount: -1, createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: 1 };
      }

      const replies = await Reply.findNested(replyId, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['author']
      });
      
      const total = await Reply.countNested(replyId);
      
      res.json({ 
        replies: replies.map(r => r.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching nested replies:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Best answers and solutions
  async markAsSolution(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check if reply exists
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      // Check if discussion exists and is a question
      const discussion = await Discussion.findById(reply.discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (discussion.type !== 'question') {
        return res.status(400).json({ message: 'Can only mark solutions for questions' });
      }

      // Check permissions (discussion author, moderator, or admin)
      if (discussion.authorId !== userId && !isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only the question author or moderators can mark solutions' });
      }

      // Mark as solution
      await Reply.markAsSolution(replyId);
      
      // Update discussion status
      await Discussion.update(discussion.id, { 
        status: 'solved',
        solvedAt: new Date(),
        solutionReplyId: replyId
      });

      // Send notification to reply author
      if (reply.authorId !== userId) {
        await NotificationService.notifySolutionMarked(reply, discussion);
      }
      
      res.json({ message: 'Reply marked as solution successfully' });
    } catch (error) {
      console.error('Error marking reply as solution:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unmarkAsSolution(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { replyId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check if reply exists and is marked as solution
      const reply = await Reply.findById(replyId);
      if (!reply) {
        return res.status(404).json({ message: 'Reply not found' });
      }

      if (!reply.isSolution) {
        return res.status(400).json({ message: 'Reply is not marked as solution' });
      }

      // Check if discussion exists
      const discussion = await Discussion.findById(reply.discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      // Check permissions (discussion author, moderator, or admin)
      if (discussion.authorId !== userId && !isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only the question author or moderators can unmark solutions' });
      }

      // Unmark as solution
      await Reply.unmarkAsSolution(replyId);
      
      // Update discussion status
      await Discussion.update(discussion.id, { 
        status: 'open',
        solvedAt: null,
        solutionReplyId: null
      });
      
      res.json({ message: 'Reply unmarked as solution successfully' });
    } catch (error) {
      console.error('Error unmarking reply as solution:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Q&A specific features
  async getQuestions(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, status, subject, category } = req.query;
      
      const filters: any = { type: 'question' };
      if (status) filters.status = status;
      if (subject) filters.subject = subject;
      if (category) filters.categoryId = category;

      const questions = await Discussion.findWithPagination(filters, {
        page: Number(page),
        limit: Number(limit),
        sort: { createdAt: -1 },
        populate: ['author', 'category']
      });
      
      const total = await Discussion.countDocuments(filters);
      
      res.json({ 
        questions: questions.map(q => q.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUnansweredQuestions(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, subject, category } = req.query;
      
      const filters: any = { 
        type: 'question',
        status: 'open',
        replyCount: 0
      };
      if (subject) filters.subject = subject;
      if (category) filters.categoryId = category;

      const questions = await Discussion.findWithPagination(filters, {
        page: Number(page),
        limit: Number(limit),
        sort: { createdAt: -1 },
        populate: ['author', 'category']
      });
      
      const total = await Discussion.countDocuments(filters);
      
      res.json({ 
        questions: questions.map(q => q.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching unanswered questions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getSolvedQuestions(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, subject, category } = req.query;
      
      const filters: any = { 
        type: 'question',
        status: 'solved'
      };
      if (subject) filters.subject = subject;
      if (category) filters.categoryId = category;

      const questions = await Discussion.findWithPagination(filters, {
        page: Number(page),
        limit: Number(limit),
        sort: { solvedAt: -1 },
        populate: ['author', 'category', 'solutionReply']
      });
      
      const total = await Discussion.countDocuments(filters);
      
      res.json({ 
        questions: questions.map(q => q.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching solved questions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async closeQuestion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { questionId } = req.params;
      const { reason } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check if question exists
      const question = await Discussion.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (question.type !== 'question') {
        return res.status(400).json({ message: 'Can only close questions' });
      }

      // Check permissions (question author, moderator, or admin)
      if (question.authorId !== userId && !isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only the question author or moderators can close questions' });
      }

      // Close question
      await Discussion.update(questionId, {
        status: 'closed',
        closedAt: new Date(),
        closedBy: userId,
        closeReason: reason
      });
      
      res.json({ message: 'Question closed successfully' });
    } catch (error) {
      console.error('Error closing question:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async reopenQuestion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { questionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check if question exists
      const question = await Discussion.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      if (question.type !== 'question') {
        return res.status(400).json({ message: 'Can only reopen questions' });
      }

      if (question.status !== 'closed') {
        return res.status(400).json({ message: 'Question is not closed' });
      }

      // Check permissions (question author, moderator, or admin)
      if (question.authorId !== userId && !isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only the question author or moderators can reopen questions' });
      }

      // Reopen question
      await Discussion.update(questionId, {
        status: 'open',
        closedAt: null,
        closedBy: null,
        closeReason: null
      });
      
      res.json({ message: 'Question reopened successfully' });
    } catch (error) {
      console.error('Error reopening question:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

// Moderation features
  async pinDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check permissions
      if (!isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only moderators and admins can pin discussions' });
      }

      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (discussion.isPinned) {
        return res.status(400).json({ message: 'Discussion is already pinned' });
      }

      // Pin discussion
      await Discussion.update(discussionId, {
        isPinned: true,
        pinnedAt: new Date(),
        pinnedBy: userId
      });
      
      res.json({ message: 'Discussion pinned successfully' });
    } catch (error) {
      console.error('Error pinning discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unpinDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check permissions
      if (!isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only moderators and admins can unpin discussions' });
      }

      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (!discussion.isPinned) {
        return res.status(400).json({ message: 'Discussion is not pinned' });
      }

      // Unpin discussion
      await Discussion.update(discussionId, {
        isPinned: false,
        pinnedAt: null,
        pinnedBy: null
      });
      
      res.json({ message: 'Discussion unpinned successfully' });
    } catch (error) {
      console.error('Error unpinning discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async lockDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const { reason } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check permissions
      if (!isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only moderators and admins can lock discussions' });
      }

      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (discussion.status === 'locked') {
        return res.status(400).json({ message: 'Discussion is already locked' });
      }

      // Lock discussion
      await Discussion.update(discussionId, {
        status: 'locked',
        lockedAt: new Date(),
        lockedBy: userId,
        lockReason: reason
      });
      
      res.json({ message: 'Discussion locked successfully' });
    } catch (error) {
      console.error('Error locking discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unlockDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check permissions
      if (!isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only moderators and admins can unlock discussions' });
      }

      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (discussion.status !== 'locked') {
        return res.status(400).json({ message: 'Discussion is not locked' });
      }

      // Unlock discussion
      await Discussion.update(discussionId, {
        status: 'open',
        lockedAt: null,
        lockedBy: null,
        lockReason: null
      });
      
      res.json({ message: 'Discussion unlocked successfully' });
    } catch (error) {
      console.error('Error unlocking discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async featureDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check permissions
      if (!isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only moderators and admins can feature discussions' });
      }

      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (discussion.isFeatured) {
        return res.status(400).json({ message: 'Discussion is already featured' });
      }

      // Feature discussion
      await Discussion.update(discussionId, {
        isFeatured: true,
        featuredAt: new Date(),
        featuredBy: userId
      });
      
      res.json({ message: 'Discussion featured successfully' });
    } catch (error) {
      console.error('Error featuring discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async unfeatureDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      const isModerator = (req as AuthenticatedRequest).user.isModerator;
      const isAdmin = (req as AuthenticatedRequest).user.isAdmin;
      
      // Check permissions
      if (!isModerator && !isAdmin) {
        return res.status(403).json({ message: 'Only moderators and admins can unfeature discussions' });
      }

      // Check if discussion exists
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (!discussion.isFeatured) {
        return res.status(400).json({ message: 'Discussion is not featured' });
      }

      // Unfeature discussion
      await Discussion.update(discussionId, {
        isFeatured: false,
        featuredAt: null,
        featuredBy: null
      });
      
      res.json({ message: 'Discussion unfeatured successfully' });
    } catch (error) {
      console.error('Error unfeaturing discussion:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Statistics and analytics
  async getForumStats(req: Request, res: Response) {
    try {
      const { period = '30d' } = req.query;
      
      const stats = await AnalyticsService.getForumStats({
        period: period as string
      });
      
      res.json({ stats });
    } catch (error) {
      console.error('Error fetching forum stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserStats(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.params;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const stats = await AnalyticsService.getUserStats(userId);
      
      res.json({ 
        stats,
        user: user.toPublicObject()
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTrendingTopics(req: Request, res: Response) {
    try {
      const { period = '7d', limit = 20 } = req.query;
      
      const topics = await AnalyticsService.getTrendingTopics({
        period: period as string,
        limit: Number(limit)
      });
      
      res.json({ topics });
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Notifications
  async getForumNotifications(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;
      
      const filters: any = { 
        userId,
        type: { 
          $in: [
            'new_reply', 
            'discussion_liked', 
            'reply_liked', 
            'mentioned', 
            'solution_marked', 
            'discussion_followed'
          ] 
        }
      };
      
      if (unreadOnly === 'true') {
        filters.isRead = false;
      }

      const notifications = await Notification.findByUser(userId, {
        filters,
        page: Number(page),
        limit: Number(limit),
        sort: { createdAt: -1 }
      });
      
      const total = await Notification.countByUser(userId, filters);
      const unreadCount = await Notification.getUnreadCount(userId);
      
      res.json({ 
        notifications: notifications.map(n => n.toSafeObject()),
        unreadCount,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching forum notifications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async markNotificationAsRead(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { notificationId } = req.params;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if notification exists and belongs to user
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Mark as read
      await Notification.markAsRead(notificationId);
      
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Polls and voting
  async createPoll(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { discussionId } = req.params;
      const { question, options, allowMultiple = false, expiresAt } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if discussion exists and user owns it
      const discussion = await Discussion.findById(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: 'Discussion not found' });
      }

      if (discussion.authorId !== userId) {
        return res.status(403).json({ message: 'Only the discussion author can create polls' });
      }

      // Check if discussion already has a poll
      const existingPoll = await Poll.findByDiscussion(discussionId);
      if (existingPoll) {
        return res.status(400).json({ message: 'Discussion already has a poll' });
      }

      // Create poll
      const pollData = {
        discussionId,
        question,
        options: options.map((option: string, index: number) => ({
          id: index + 1,
          text: option,
          votes: 0
        })),
        allowMultiple,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: userId
      };

      const poll = await Poll.create(pollData);
      
      // Update discussion type to poll
      await Discussion.update(discussionId, { type: 'poll' });
      
      res.status(201).json({ 
        poll: poll.toSafeObject(), 
        message: 'Poll created successfully' 
      });
    } catch (error) {
      console.error('Error creating poll:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async votePoll(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pollId } = req.params;
      const { optionIds } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Check if poll exists
      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
      }

      // Check if poll is expired
      if (poll.expiresAt && new Date() > poll.expiresAt) {
        return res.status(400).json({ message: 'Poll has expired' });
      }

      // Check if user already voted
      const existingVote = await Poll.getUserVote(pollId, userId);
      if (existingVote) {
        return res.status(400).json({ message: 'You have already voted on this poll' });
      }

      // Validate option IDs
      const validOptionIds = poll.options.map(o => o.id);
      const invalidOptions = optionIds.filter((id: number) => !validOptionIds.includes(id));
      if (invalidOptions.length > 0) {
        return res.status(400).json({ message: 'Invalid option IDs provided' });
      }

      // Check multiple choice rules
      if (!poll.allowMultiple && optionIds.length > 1) {
        return res.status(400).json({ message: 'This poll only allows single choice' });
      }

      // Record vote
      await Poll.vote(pollId, userId, optionIds);
      
      res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
      console.error('Error voting on poll:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPollResults(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { pollId } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id;
      
      // Check if poll exists
      const poll = await Poll.findById(pollId);
      if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
      }

      // Get poll results
      const results = await Poll.getResults(pollId);
      
      // Get user's vote if authenticated
      let userVote = null;
      if (userId) {
        userVote = await Poll.getUserVote(pollId, userId);
      }
      
      res.json({ 
        results: {
          ...results,
          poll: poll.toSafeObject()
        },
        userVote
      });
    } catch (error) {
      console.error('Error fetching poll results:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // User activity and profiles
  async getUserDiscussions(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.params;
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let sortOptions: any = {};
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { viewCount: -1, likeCount: -1 };
          break;
        case 'replies':
          sortOptions = { replyCount: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const discussions = await Discussion.findByAuthor(userId, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['category']
      });
      
      const total = await Discussion.countByAuthor(userId);
      
      res.json({ 
        discussions: discussions.map(d => d.toSafeObject()),
        user: user.toPublicObject(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching user discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserReplies(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.params;
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let sortOptions: any = {};
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { likeCount: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const replies = await Reply.findByAuthor(userId, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['discussion']
      });
      
      const total = await Reply.countByAuthor(userId);
      
      res.json({ 
        replies: replies.map(r => r.toSafeObject()),
        user: user.toPublicObject(),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching user replies:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getMyDiscussions(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { page = 1, limit = 20, sort = 'recent', status } = req.query;
      
      const filters: any = { authorId: userId };
      if (status) filters.status = status;

      let sortOptions: any = {};
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { viewCount: -1, likeCount: -1 };
          break;
        case 'replies':
          sortOptions = { replyCount: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const discussions = await Discussion.findWithPagination(filters, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['category']
      });
      
      const total = await Discussion.countDocuments(filters);
      
      res.json({ 
        discussions: discussions.map(d => d.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching my discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getMyReplies(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      
      let sortOptions: any = {};
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { likeCount: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const replies = await Reply.findByAuthor(userId, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['discussion']
      });
      
      const total = await Reply.countByAuthor(userId);
      
      res.json({ 
        replies: replies.map(r => r.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching my replies:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getMyActivity(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { page = 1, limit = 20, type } = req.query;
      
      const activities = await AnalyticsService.getUserActivity(userId, {
        page: Number(page),
        limit: Number(limit),
        type: type as string
      });
      
      res.json({ 
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: activities.length,
          pages: Math.ceil(activities.length / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching my activity:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // School and study group specific methods
  async getSchoolDiscussions(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { schoolId } = req.params;
      const { page = 1, limit = 20, sort = 'recent', category } = req.query;
      
      const filters: any = { schoolId };
      if (category) filters.categoryId = category;

      let sortOptions: any = {};
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'popular':
          sortOptions = { viewCount: -1, likeCount: -1 };
          break;
        case 'replies':
          sortOptions = { replyCount: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      const discussions = await Discussion.findWithPagination(filters, {
        page: Number(page),
        limit: Number(limit),
        sort: sortOptions,
        populate: ['author', 'category']
      });
      
      const total = await Discussion.countDocuments(filters);
      
      res.json({ 
        discussions: discussions.map(d => d.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching school discussions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async createSchoolDiscussion(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { schoolId } = req.params;
      const { title, content, category, type = 'discussion' } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      
      // Verify user belongs to the school
      const user = await User.findById(userId);
      if (user?.schoolId !== schoolId) {
        return res.status(403).json({ message: 'You can only create discussions for your school' });
      }

      // Create discussion
      const discussionData = {
        title,
        content: sanitizeHtml(content),
        slug: generateSlug(title),
        authorId: userId,
        schoolId,
        categoryId: category,
        type,
        status: 'open'
      };

      const discussion = await Discussion.create(discussionData);
      
      res.status(201).json({ 
        discussion: discussion.toSafeObject(),
        message: 'School discussion created successfully' 
      });
    } catch (error) {
      console.error('Error creating school discussion:', error);
      res.status(500).{ message: 'Internal server error' });
    }
  }
}

// Export the controller class
export default ForumController;
