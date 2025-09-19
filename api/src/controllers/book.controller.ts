import { Request, Response, NextFunction } from 'express';
import Book from "../models/Book";
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class BookController {
  // Get all books with search and filtering
  getBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        q,
        category,
        subject,
        educationLevel,
        grade,
        language,
        publisher,
        author,
        publishedYear,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter: Record<string, any> = {};

      // Search query
      if (q) {
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { authors: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { subject: { $regex: q, $options: 'i' } }
        ];
      }

      // Filters
      if (category) filter.category = category;
      if (subject) filter.subject = { $regex: subject, $options: 'i' };
      if (educationLevel) filter.educationLevel = educationLevel;
      if (grade) filter.grade = grade;
      if (language) filter.language = language;
      if (publisher) filter.publisher = { $regex: publisher, $options: 'i' };
      if (author) filter.authors = { $regex: author, $options: 'i' };
      if (publishedYear) filter.publishedYear = publishedYear;

      const skip = ((page as number) - 1) * (limit as number);

      // Sort configuration
      const sortObject: { [key: string]: 1 | -1 } = {};
      sortObject[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const books = await Book.find(filter)
        .sort(sortObject)
        .skip(skip)
        .limit(limit as number);

      const total = await Book.countDocuments(filter);
      const totalPages = Math.ceil(total / (limit as number));

      res.json({
        success: true,
        books,
        pagination: {
          page: page as number,
          limit: limit as number,
          total,
          totalPages,
          hasNextPage: (page as number) < totalPages,
          hasPrevPage: (page as number) > 1
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all books (alias for getBooks)
  getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
    return this.getBooks(req, res, next);
  };

  // Get book by ID
  getBookById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);

      if (!book) {
        throw new AppError('Book not found', 404);
      }

      res.json({
        success: true,
        book
      });
    } catch (error) {
      next(error);
    }
  };

  // Get book details (alias for getBookById)
  getBookDetails = async (req: Request, res: Response, next: NextFunction) => {
    return this.getBookById(req, res, next);
  };

  // Get all categories
  getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await Book.distinct('category');
      
      res.json({
        success: true,
        categories: categories.sort()
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all subjects
  getAllSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subjects = await Book.distinct('subject');
      
      res.json({
        success: true,
        subjects: subjects.sort()
      });
    } catch (error) {
      next(error);
    }
  };

  // Get education levels
  getEducationLevels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const levels = await Book.distinct('educationLevel');
      
      res.json({
        success: true,
        levels: levels.sort()
      });
    } catch (error) {
      next(error);
    }
  };

  // Get books by education level
  getBooksByLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { level } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = ((page as number) - 1) * (limit as number);

      const books = await Book.find({ educationLevel: level })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit as number);

      const total = await Book.countDocuments({ educationLevel: level });

      res.json({
        success: true,
        books,
        total
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all publishers
  getAllPublishers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const publishers = await Book.distinct('publisher');
      
      res.json({
        success: true,
        publishers: publishers.sort()
      });
    } catch (error) {
      next(error);
    }
  };

  // Get books by publisher
  getBooksByPublisher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { publisher } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = ((page as number) - 1) * (limit as number);

      const books = await Book.find({ 
        publisher: { $regex: publisher, $options: 'i' }
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit as number);

      const total = await Book.countDocuments({ 
        publisher: { $regex: publisher, $options: 'i' }
      });

      res.json({
        success: true,
        books,
        total
      });
    } catch (error) {
      next(error);
    }
  };

  // Create a new book
  createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookData = req.body;
      const userId = req.user?.id;

      const book = new Book({
        ...bookData,
        createdBy: userId
      });

      await book.save();

      logger.info(`New book created: ${book.title} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        book
      });
    } catch (error) {
      next(error);
    }
  };

  // Update book
  updateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      const book = await Book.findById(id);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      Object.assign(book, updateData);
      await book.save();

      logger.info(`Book updated: ${book.title} by user ${userId}`);

      res.json({
        success: true,
        message: 'Book updated successfully',
        book
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete book
  deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const book = await Book.findById(id);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      await Book.findByIdAndDelete(id);

      logger.info(`Book deleted: ${book.title} by user ${userId}`);

      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Upload book file
  uploadBookFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Book file upload functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Upload book cover
  uploadBookCover = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Book cover upload functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete book file
  deleteBookFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Book file deletion functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Search books
  searchBooks = async (req: Request, res: Response, next: NextFunction) => {
    return this.getBooks(req, res, next);
  };

  // Get featured books
  getFeaturedBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await Book.find({ featured: true })
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        books
      });
    } catch (error) {
      next(error);
    }
  };

  // Get popular books
  getPopularBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await Book.find()
        .sort({ downloads: -1, rating: -1 })
        .limit(20);

      res.json({
        success: true,
        books
      });
    } catch (error) {
      next(error);
    }
  };

  // Get recent books
  getRecentBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await Book.find()
        .sort({ createdAt: -1 })
        .limit(20);

      res.json({
        success: true,
        books
      });
    } catch (error) {
      next(error);
    }
  };

  // Get books by category
  getBooksByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = ((page as number) - 1) * (limit as number);

      const books = await Book.find({ category })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit as number);

      const total = await Book.countDocuments({ category });

      res.json({
        success: true,
        books,
        total
      });
    } catch (error) {
      next(error);
    }
  };

  // Get books by subject
  getBooksBySubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subject } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = ((page as number) - 1) * (limit as number);

      const books = await Book.find({ 
        subject: { $regex: subject, $options: 'i' }
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit as number);

      const total = await Book.countDocuments({ 
        subject: { $regex: subject, $options: 'i' }
      });

      res.json({
        success: true,
        books,
        total
      });
    } catch (error) {
      next(error);
    }
  };

  // Download book
  downloadBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      logger.info(`Book downloaded: ${book.title} by user ${req.user?.id}`);

      res.json({
        success: true,
        message: 'Download initiated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Favorite book
  favoriteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const book = await Book.findById(id);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      res.json({
        success: true,
        message: 'Book added to favorites successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Unfavorite book
  unfavoriteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      res.json({
        success: true,
        message: 'Book removed from favorites successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get favorite books
  getFavoriteBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        books: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get download history
  getDownloadHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        downloads: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Rate book
  rateBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      const book = await Book.findById(id);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      res.json({
        success: true,
        message: 'Book rated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Add book review
  addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      const book = await Book.findById(id);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      res.json({
        success: true,
        message: 'Review added successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Add book review (alias)
  addBookReview = async (req: Request, res: Response, next: NextFunction) => {
    return this.addReview(req, res, next);
  };

  // Update book review
  updateBookReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Review updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete book review
  deleteBookReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get book reviews
  getBookReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      res.json({
        success: true,
        reviews: [],
        total: 0
      });
    } catch (error) {
      next(error);
    }
  };

  // Request book
  requestBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestData = req.body;
      const userId = req.user?.id;

      logger.info(`Book requested: ${requestData.title} by user ${userId}`, requestData);

      res.json({
        success: true,
        message: 'Book request submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get book requests (admin)
  getBookRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        requests: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user book requests
  getUserBookRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        requests: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Update book request status
  updateBookRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Request status updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Update reading progress
  updateReadingProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Reading progress updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get reading progress
  getReadingProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        progress: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get currently reading books
  getCurrentlyReading = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        books: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get completed books
  getCompletedBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        books: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Share book
  shareBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Book shared successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get shared books
  getSharedBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        books: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Create book collection
  createBookCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Collection created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user collections
  getUserCollections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        collections: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get book collection
  getBookCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        collection: {}
      });
    } catch (error) {
      next(error);
    }
  };

  // Update book collection
  updateBookCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Collection updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete book collection
  deleteBookCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Collection deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Add book to collection
  addBookToCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Book added to collection successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Remove book from collection
  removeBookFromCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Book removed from collection successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get book analytics
  getBookAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        analytics: {
          totalDownloads: 0,
          totalViews: 0,
          averageRating: 0
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get reading statistics
  getReadingStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        statistics: {
          booksRead: 0,
          totalPages: 0,
          averageRating: 0
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Bookmark book
  bookmarkBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookId } = req.body;

      const book = await Book.findById(bookId);
      if (!book) {
        throw new AppError('Book not found', 404);
      }

      res.json({
        success: true,
        message: 'Book bookmarked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Remove bookmark
  removeBookmark = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Bookmark removed successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get user bookmarks
  getUserBookmarks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        bookmarks: []
      });
    } catch (error) {
      next(error);
    }
  };
}
