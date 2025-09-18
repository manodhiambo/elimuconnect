import { UserService } from './user.service';
import { NotificationService } from './notification.service';
import { NotificationType } from '../models/User';

interface Badge {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
}

const BADGES: Record<string, Badge> = {
  FIRST_LOGIN: {
    id: 'first_login',
    name: 'Welcome Aboard',
    description: 'Logged in for the first time',
    points: 10,
    icon: '👋'
  },
  FIRST_BOOK_READ: {
    id: 'first_book_read',
    name: 'Book Explorer',
    description: 'Read your first book',
    points: 25,
    icon: '📚'
  },
  QUIZ_MASTER: {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Completed 10 quizzes',
    points: 100,
    icon: '🧠'
  }
};

export class AchievementService {
  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  async checkAchievements(userId: string, action: string, data?: any) {
    const user = await this.userService.findById(userId);
    if (!user) return;

    const currentBadges = user.progress?.badges || [];

    switch (action) {
      case 'book_read':
        await this.checkBookReader(userId, (user.progress?.booksRead || 0) + 1, currentBadges);
        break;
      case 'quiz_completed':
        await this.checkQuizMaster(userId, (user.progress?.testsCompleted || 0) + 1, currentBadges);
        break;
    }
  }

  private async checkBookReader(userId: string, booksRead: number, currentBadges: string[]) {
    if (booksRead === 1 && !currentBadges.includes(BADGES.FIRST_BOOK_READ.id)) {
      await this.awardBadge(userId, BADGES.FIRST_BOOK_READ);
    }
  }

  private async checkQuizMaster(userId: string, testsCompleted: number, currentBadges: string[]) {
    if (testsCompleted === 10 && !currentBadges.includes(BADGES.QUIZ_MASTER.id)) {
      await this.awardBadge(userId, BADGES.QUIZ_MASTER);
    }
  }

  private async awardBadge(userId: string, badge: Badge) {
    await this.userService.addBadge(userId, badge.id);
    await this.userService.addPoints(userId, badge.points);

    await this.notificationService.create(
      userId,
      NotificationType.ACHIEVEMENT,
      `Achievement Unlocked!`,
      `You've earned the "${badge.name}" badge! +${badge.points} points`,
      { badge: badge.id, points: badge.points }
    );
  }
}
