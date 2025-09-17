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
}

// Categories and tags
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

  async getDiscussionsByCategory(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { categoryId } = req.params;
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      
      const filters: any = { categoryId };

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
      console.error('Error fetching discussions by category:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAllTags(req: Request, res: Response) {
    try {
      const { popular = false, limit = 50 } = req.query;
      
      let tags;
      if (popular === 'true') {
        tags = await Tag.findPopular(Number(limit));
      } else {
        tags = await Tag.findAll();
      }
      
      res.json({ 
        tags: tags.map(t => t.toSafeObject())
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDiscussionsByTag(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tag } = req.params;
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      
      const filters: any = { tags: { $in: [tag] } };

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
        tag,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching discussions by tag:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Subject-specific forums
  async getAllSubjects(req: Request, res: Response) {
    try {
      const subjects = await Discussion.distinct('subject');
      
      res.json({ 
        subjects: subjects.filter(Boolean)
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getDiscussionsBySubject(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { subject } = req.params;
      const { page = 1, limit = 20, sort = 'recent' } = req.query;
      
      const filters: any = { subject };

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
        subject,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching discussions by subject:', error);
      res.status(500).json({ message: 'Internal server error' });
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

  async getBookmarkedDiscussions(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const bookmarks = await Bookmark.findByUserAndType(userId, 'discussion', {
        page: Number(page),
        limit: Number(limit),
        populate: ['target']
      });
      
      const total = await Bookmark.countByUserAndType(userId, 'discussion');
      
      res.json({ 
        discussions: bookmarks.map(b => b.target.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching bookmarked discussions:', error);
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

  async getFollowedDiscussions(req: Request, res: Response) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const follows = await Follow.findByUser(userId, {
        page: Number(page),
        limit: Number(limit),
        populate: ['discussion']
      });
      
      const total = await Follow.countByUser(userId);
      
      res.json({ 
        discussions: follows.map(f => f.discussion.toSafeObject()),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching followed discussions:', error);
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
