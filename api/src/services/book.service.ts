// api/src/services/book.service.ts
import { BaseService } from './base.service';
import { Book, BookDocument } from '../models/Book';

export class BookService extends BaseService<BookDocument> {
  constructor() {
    super(Book);
  }

  protected getSearchFields(): string[] {
    return ['title', 'author', 'description', 'tags'];
  }

  async findBySubjectAndGrade(subject: string, level: string, grade: string): Promise<BookDocument[]> {
    return await this.model
      .find({ subject, level, grade, verified: true })
      .sort({ rating: -1, downloads: -1 })
      .populate('uploadedBy', 'profile.firstName profile.lastName')
      .exec();
  }

  async incrementDownloads(bookId: string): Promise<BookDocument | null> {
    return await this.model.findByIdAndUpdate(
      bookId,
      { $inc: { downloads: 1 } },
      { new: true }
    );
  }

  async updateRating(bookId: string, rating: number, reviewCount: number): Promise<BookDocument | null> {
    return await this.model.findByIdAndUpdate(
      bookId,
      { rating, reviews: reviewCount },
      { new: true }
    );
  }

  async getPopularBooks(limit = 10): Promise<BookDocument[]> {
    return await this.model
      .find({ verified: true })
      .sort({ downloads: -1, rating: -1 })
      .limit(limit)
      .populate('uploadedBy', 'profile.firstName profile.lastName')
      .exec();
  }

  async getRecentBooks(limit = 10): Promise<BookDocument[]> {
    return await this.model
      .find({ verified: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('uploadedBy', 'profile.firstName profile.lastName')
      .exec();
  }

  async verifyBook(bookId: string): Promise<BookDocument | null> {
    return await this.model.findByIdAndUpdate(
      bookId,
      { verified: true },
      { new: true }
    );
  }
}
