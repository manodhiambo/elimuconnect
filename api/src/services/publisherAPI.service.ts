import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export interface PublisherBook {
  id: string;
  title: string;
  authors: string[];
  isbn: string;
  publisher: string;
  publishedDate: string;
  description: string;
  subject: string;
  level: string;
  language: string;
  pageCount: number;
  coverImage: string;
  price?: number;
  availability: boolean;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface PublisherSearchParams {
  query?: string;
  subject?: string;
  level?: string;
  language?: string;
  publisher?: string;
  page?: number;
  limit?: number;
}

export class PublisherAPIService {
  private publishers: Map<string, AxiosInstance>;

  constructor() {
    this.publishers = new Map();
    this.initializePublishers();
  }

  private initializePublishers() {
    // Kenya Literature Bureau (KLB)
    if (process.env.KLB_API_URL && process.env.KLB_API_KEY) {
      this.publishers.set('klb', axios.create({
        baseURL: process.env.KLB_API_URL,
        headers: {
          'Authorization': `Bearer ${process.env.KLB_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }));
    }

    // Longhorn Publishers
    if (process.env.LONGHORN_API_URL && process.env.LONGHORN_API_KEY) {
      this.publishers.set('longhorn', axios.create({
        baseURL: process.env.LONGHORN_API_URL,
        headers: {
          'Authorization': `Bearer ${process.env.LONGHORN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }));
    }

    // Oxford University Press
    if (process.env.OXFORD_API_URL && process.env.OXFORD_API_KEY) {
      this.publishers.set('oxford', axios.create({
        baseURL: process.env.OXFORD_API_URL,
        headers: {
          'Authorization': `Bearer ${process.env.OXFORD_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }));
    }

    // Macmillan Education
    if (process.env.MACMILLAN_API_URL && process.env.MACMILLAN_API_KEY) {
      this.publishers.set('macmillan', axios.create({
        baseURL: process.env.MACMILLAN_API_URL,
        headers: {
          'Authorization': `Bearer ${process.env.MACMILLAN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }));
    }

    // Google Books API (fallback)
    this.publishers.set('google', axios.create({
      baseURL: 'https://www.googleapis.com/books/v1',
      params: {
        key: process.env.GOOGLE_BOOKS_API_KEY
      },
      timeout: 10000
    }));
  }

  async searchBooks(params: PublisherSearchParams): Promise<PublisherBook[]> {
    const allBooks: PublisherBook[] = [];

    // Search across all configured publishers
    const searchPromises = Array.from(this.publishers.entries()).map(([publisherName, client]) => 
      this.searchFromPublisher(publisherName, client, params)
    );

    try {
      const results = await Promise.allSettled(searchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allBooks.push(...result.value);
        } else {
          const publisherName = Array.from(this.publishers.keys())[index];
          logger.warn(`Failed to search from ${publisherName}:`, result.reason);
        }
      });

      // Remove duplicates based on ISBN or title
      return this.removeDuplicates(allBooks);
    } catch (error) {
      logger.error('Error searching books from publishers:', error);
      throw new AppError('Failed to search books', 500);
    }
  }

  private async searchFromPublisher(
    publisherName: string, 
    client: AxiosInstance, 
    params: PublisherSearchParams
  ): Promise<PublisherBook[]> {
    try {
      switch (publisherName) {
        case 'klb':
          return await this.searchKLB(client, params);
        case 'longhorn':
          return await this.searchLonghorn(client, params);
        case 'oxford':
          return await this.searchOxford(client, params);
        case 'macmillan':
          return await this.searchMacmillan(client, params);
        case 'google':
          return await this.searchGoogleBooks(client, params);
        default:
          return [];
      }
    } catch (error) {
      logger.warn(`Failed to search from ${publisherName}:`, error);
      return [];
    }
  }

  private async searchKLB(client: AxiosInstance, params: PublisherSearchParams): Promise<PublisherBook[]> {
    const response = await client.get('/books/search', {
      params: {
        q: params.query,
        subject: params.subject,
        level: params.level,
        page: params.page || 1,
        limit: params.limit || 20
      }
    });

    return response.data.books.map((book: any) => this.transformKLBBook(book));
  }

  private async searchLonghorn(client: AxiosInstance, params: PublisherSearchParams): Promise<PublisherBook[]> {
    const response = await client.get('/api/books', {
      params: {
        search: params.query,
        category: params.subject,
        grade_level: params.level,
        page: params.page || 1,
        per_page: params.limit || 20
      }
    });

    return response.data.data.map((book: any) => this.transformLonghornBook(book));
  }

  private async searchOxford(client: AxiosInstance, params: PublisherSearchParams): Promise<PublisherBook[]> {
    const response = await client.get('/catalogue/search', {
      params: {
        query: params.query,
        subject: params.subject,
        level: params.level,
        offset: ((params.page || 1) - 1) * (params.limit || 20),
        limit: params.limit || 20
      }
    });

    return response.data.results.map((book: any) => this.transformOxfordBook(book));
  }

  private async searchMacmillan(client: AxiosInstance, params: PublisherSearchParams): Promise<PublisherBook[]> {
    const response = await client.get('/v1/products/search', {
      params: {
        q: params.query,
        subject_area: params.subject,
        education_level: params.level,
        page: params.page || 1,
        size: params.limit || 20
      }
    });

    return response.data.products.map((book: any) => this.transformMacmillanBook(book));
  }

  private async searchGoogleBooks(client: AxiosInstance, params: PublisherSearchParams): Promise<PublisherBook[]> {
    let query = params.query || '';
    if (params.subject) query += ` subject:${params.subject}`;
    if (params.level) query += ` ${params.level}`;

    const response = await client.get('/volumes', {
      params: {
        q: query,
        startIndex: ((params.page || 1) - 1) * (params.limit || 20),
        maxResults: params.limit || 20,
        printType: 'books',
        langRestrict: params.language || 'en'
      }
    });

    return (response.data.items || []).map((item: any) => this.transformGoogleBook(item));
  }

  // Transform methods for different publisher formats
  private transformKLBBook(book: any): PublisherBook {
    return {
      id: book.id,
      title: book.title,
      authors: book.authors || [],
      isbn: book.isbn,
      publisher: 'Kenya Literature Bureau',
      publishedDate: book.published_date,
      description: book.description,
      subject: book.subject,
      level: book.level,
      language: book.language || 'English',
      pageCount: book.page_count || 0,
      coverImage: book.cover_image || '',
      price: book.price,
      availability: book.available,
      downloadUrl: book.download_url,
      previewUrl: book.preview_url
    };
  }

  private transformLonghornBook(book: any): PublisherBook {
    return {
      id: book.id.toString(),
      title: book.title,
      authors: book.author ? [book.author] : [],
      isbn: book.isbn || '',
      publisher: 'Longhorn Publishers',
      publishedDate: book.publication_year,
      description: book.description,
      subject: book.category,
      level: book.grade_level,
      language: 'English',
      pageCount: book.pages || 0,
      coverImage: book.cover_image || '',
      price: book.price,
      availability: true,
      downloadUrl: book.pdf_url,
      previewUrl: book.sample_url
    };
  }

  private transformOxfordBook(book: any): PublisherBook {
    return {
      id: book.product_id,
      title: book.title,
      authors: book.authors || [],
      isbn: book.isbn,
      publisher: 'Oxford University Press',
      publishedDate: book.publication_date,
      description: book.description,
      subject: book.subject,
      level: book.level,
      language: book.language || 'English',
      pageCount: book.page_count || 0,
      coverImage: book.cover_url || '',
      availability: book.available,
      previewUrl: book.preview_url
    };
  }

  private transformMacmillanBook(book: any): PublisherBook {
    return {
      id: book.product_id,
      title: book.title,
      authors: book.authors || [],
      isbn: book.isbn,
      publisher: 'Macmillan Education',
      publishedDate: book.published_date,
      description: book.description,
      subject: book.subject_area,
      level: book.education_level,
      language: book.language || 'English',
      pageCount: book.pages || 0,
      coverImage: book.thumbnail || '',
      availability: book.status === 'available',
      downloadUrl: book.digital_url,
      previewUrl: book.sample_url
    };
  }

  private transformGoogleBook(item: any): PublisherBook {
    const volumeInfo = item.volumeInfo;
    const saleInfo = item.saleInfo;

    return {
      id: item.id,
      title: volumeInfo.title,
      authors: volumeInfo.authors || [],
      isbn: volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || '',
      publisher: volumeInfo.publisher || 'Unknown',
      publishedDate: volumeInfo.publishedDate,
      description: volumeInfo.description,
      subject: volumeInfo.categories?.[0] || 'General',
      level: this.inferLevelFromTitle(volumeInfo.title),
      language: volumeInfo.language || 'en',
      pageCount: volumeInfo.pageCount || 0,
      coverImage: volumeInfo.imageLinks?.thumbnail || '',
      price: saleInfo?.listPrice?.amount,
      availability: saleInfo?.saleability === 'FOR_SALE',
      previewUrl: volumeInfo.previewLink
    };
  }

  private inferLevelFromTitle(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('primary') || lower.includes('grade 1') || lower.includes('class 1')) return 'primary';
    if (lower.includes('secondary') || lower.includes('form') || lower.includes('o level')) return 'secondary';
    if (lower.includes('university') || lower.includes('college') || lower.includes('degree')) return 'university';
    return 'general';
  }

  private removeDuplicates(books: PublisherBook[]): PublisherBook[] {
    const seen = new Set<string>();
    return books.filter(book => {
      const key = book.isbn || book.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async getBookDetails(publisherName: string, bookId: string): Promise<PublisherBook | null> {
    const client = this.publishers.get(publisherName);
    if (!client) {
      throw new AppError(`Publisher ${publisherName} not configured`, 400);
    }

    try {
      // Implementation would depend on each publisher's API
      // This is a simplified version
      const response = await client.get(`/books/${bookId}`);
      return this.transformBookByPublisher(publisherName, response.data);
    } catch (error) {
      logger.error(`Failed to get book details from ${publisherName}:`, error);
      return null;
    }
  }

  private transformBookByPublisher(publisherName: string, data: any): PublisherBook {
    switch (publisherName) {
      case 'klb':
        return this.transformKLBBook(data);
      case 'longhorn':
        return this.transformLonghornBook(data);
      case 'oxford':
        return this.transformOxfordBook(data);
      case 'macmillan':
        return this.transformMacmillanBook(data);
      case 'google':
        return this.transformGoogleBook(data);
      default:
        throw new AppError(`Unknown publisher: ${publisherName}`, 400);
    }
  }
}
