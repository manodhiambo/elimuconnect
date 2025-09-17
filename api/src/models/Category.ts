// Category Model - Place at: api/src/models/Category.ts

export interface ICategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  color: string;
  icon?: string;
  parentId?: string; // For nested categories
  isActive: boolean;
  discussionCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  static async findAll(): Promise<ICategory[]> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async findById(id: string): Promise<ICategory | null> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async findBySlug(slug: string): Promise<ICategory | null> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async create(data: Partial<ICategory>): Promise<ICategory> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async delete(id: string): Promise<boolean> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async findByParent(parentId: string): Promise<ICategory[]> {
    // Get subcategories
    throw new Error('Method not implemented');
  }

  static async getPopular(limit: number = 10): Promise<ICategory[]> {
    // Get categories by discussion count
    throw new Error('Method not implemented');
  }

  static async incrementDiscussionCount(categoryId: string): Promise<void> {
    // Increment discussion count when new discussion is created
    throw new Error('Method not implemented');
  }

  static async decrementDiscussionCount(categoryId: string): Promise<void> {
    // Decrement discussion count when discussion is deleted
    throw new Error('Method not implemented');
  }
}

export default Category;
