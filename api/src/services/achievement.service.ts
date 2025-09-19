import { userService } from './user.service';
import { notificationService } from './notification.service';
import { NotificationType } from '../models/User';

interface Badge {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
}

export class AchievementService {
  private userService = userService;
  private notificationService = notificationService;

  private badges: Badge[] = [
    {
      id: 'first_login',
      name: 'Welcome Aboard',
      description: 'Completed first login',
      points: 10,
      icon: '🎉'
    },
    {
      id: 'book_reader',
      name: 'Book Reader',
      description: 'Read 5 books',
      points: 50,
      icon: '📚'
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Completed 10 quizzes',
      points: 75,
      icon: '🏆'
    }
  ];

  async trackUserProgress(userId: string, action: string, metadata?: any) {
    try {
      const user = await this.userService.findById(userId);
      if (!user) return;

      const currentBadges = user.progress?.badges || [];

      if (action === 'book_read') {
        await this.checkBookReader(userId, (user.progress?.booksRead || 0) + 1, currentBadges);
      } else if (action === 'quiz_completed') {
        await this.checkQuizMaster(userId, (user.progress?.testsCompleted || 0) + 1, currentBadges);
      }
    } catch (error) {
      console.error('Error tracking user progress:', error);
    }
  }

  private async checkBookReader(userId: string, booksRead: number, currentBadges: string[]) {
    if (booksRead >= 5 && !currentBadges.includes('book_reader')) {
      const badge = this.badges.find(b => b.id === 'book_reader');
      if (badge) {
        await this.awardBadge(userId, badge);
      }
    }
  }

  private async checkQuizMaster(userId: string, quizzesCompleted: number, currentBadges: string[]) {
    if (quizzesCompleted >= 10 && !currentBadges.includes('quiz_master')) {
      const badge = this.badges.find(b => b.id === 'quiz_master');
      if (badge) {
        await this.awardBadge(userId, badge);
      }
    }
  }

  private async awardBadge(userId: string, badge: Badge) {
    await this.userService.addBadge(userId, badge.id);
    await this.userService.addPoints(userId, badge.points);

    // Create notification
    await this.notificationService.create({
      userId,
      type: NotificationType.ACHIEVEMENT,
      title: 'Achievement Unlocked!',
      message: `You've earned the "${badge.name}" badge! +${badge.points} points`,
      data: { badge: badge.id, points: badge.points }
    });
  }

  async getUserBadges(userId: string): Promise<Badge[]> {
    const user = await this.userService.findById(userId);
    if (!user || !user.progress?.badges) return [];

    return this.badges.filter(badge => user.progress?.badges?.includes(badge.id));
  }

  async getUserPoints(userId: string): Promise<number> {
    const user = await this.userService.findById(userId);
    return user?.progress?.points || 0;
  }
}

export const achievementService = new AchievementService();
