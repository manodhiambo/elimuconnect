// Like Model - Place at: api/src/models/Like.ts

export interface ILike {
  id: string;
  userId: string;
  targetType: 'discussion' | 'reply';
  targetId: string;
  createdAt: Date;
}

export class Like {
  static async create(userId: string, targetType: 'discussion' | 'reply', targetId: string): Promise<ILike> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async delete(userId: string, targetType: 'discussion' | 'reply', targetId: string): Promise<boolean> {
    // Implement based on your database solution
    throw new Error('Method not implemented');
  }

  static async exists(userId: string, targetType: 'discussion' | 'reply', targetId: string): Promise<boolean> {
    // Check if user has already liked this item
    throw new Error('Method not implemented');
  }

  static async getCount(targetType: 'discussion' | 'reply', targetId: string): Promise<number> {
    // Get total like count for an item
    throw new Error('Method not implemented');
  }

  static async getLikers(targetType: 'discussion' | 'reply', targetId: string, limit: number = 20): Promise<Array<{
    userId: string;
    likedAt: Date;
  }>> {
    // Get list of users who liked an item
    throw new Error('Method not implemented');
  }

  static async getUserLikes(userId: string, targetType?: 'discussion' | 'reply', limit: number = 20): Promise<ILike[]> {
    // Get all items liked by a user
    throw new Error('Method not implemented');
  }

  static async getMostLiked(targetType: 'discussion' | 'reply', period: '1d' | '7d' | '30d' | 'all' = 'all', limit: number = 10): Promise<Array<{
    targetId: string;
    likeCount: number;
  }>> {
    // Get most liked items in a time period
    throw new Error('Method not implemented');
  }

  static async toggle(userId: string, targetType: 'discussion' | 'reply', targetId: string): Promise<{
    liked: boolean;
    likeCount: number;
  }> {
    // Toggle like (add if not exists, remove if exists)
    throw new Error('Method not implemented');
  }

  static async bulkCheck(userId: string, targets: Array<{ targetType: 'discussion' | 'reply', targetId: string }>): Promise<Array<{
    targetType: 'discussion' | 'reply';
    targetId: string;
    isLiked: boolean;
  }>> {
    // Check if user has liked multiple items (for UI state)
    throw new Error('Method not implemented');
  }

  static async getUserLikeStats(userId: string): Promise<{
    totalLikesGiven: number;
    totalLikesReceived: number;
    discussionLikesReceived: number;
    replyLikesReceived: number;
  }> {
    // Get user's like statistics
    throw new Error('Method not implemented');
  }

  static async getRecentActivity(userId: string, limit: number = 20): Promise<Array<{
    targetType: 'discussion' | 'reply';
    targetId: string;
    likedAt: Date;
  }>> {
    // Get user's recent like activity
    throw new Error('Method not implemented');
  }

  static async removeAllLikesForTarget(targetType: 'discussion' | 'reply', targetId: string): Promise<number> {
    // Remove all likes for a target (when target is deleted)
    throw new Error('Method not implemented');
  }

  static async removeAllLikesForUser(userId: string): Promise<number> {
    // Remove all likes by a user (when user is deleted)
    throw new Error('Method not implemented');
  }
}

export default Like;
