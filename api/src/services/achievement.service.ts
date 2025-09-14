// api/src/services/achievement.service.ts
import { UserService } from './user.service';
import { NotificationService } from './notification.service';
import { ACHIEVEMENT_BADGES, NotificationType } from '@elimuconnect/shared/constants';
import { logger } from '@elimuconnect/shared/utils';

export class AchievementService {
  private userService: UserService;
  private notificationService: NotificationService;

  constructor() {
    this.userService = new UserService();
    this.notificationService = new NotificationService();
  }

  async checkAndAwardAchievements(userId: string, action: string, data?: any): Promise<void> {
    try {
      const user = await this.userService.findById(userId);
      if (!user) return;

      const currentBadges = user.progress.badges || [];

      switch (action) {
        case 'first_login':
          await this.checkFirstLogin(userId, currentBadges);
          break;
        case 'book_read':
          await this.checkBookReader(userId, user.progress.booksRead + 1, currentBadges);
          break;
        case 'quiz_completed':
          await this.checkQuizMaster(userId, user.progress.testsCompleted + 1, currentBadges);
          break;
        case 'streak_updated':
          await this.checkStreakAchievements(userId, data.streakDays, currentBadges);
          break;
        case 'quiz_scored':
          await this.checkTopScorer(userId, data.score, currentBadges);
          break;
      }
    } catch (error) {
      logger.error('Failed to check achievements:', error);
    }
  }

  private async awardBadge(userId: string, badgeKey: string, currentBadges: string[]): Promise<void> {
    if (currentBadges.includes(badgeKey)) return;

    const badge = ACHIEVEMENT_BADGES[badgeKey as keyof typeof ACHIEVEMENT_BADGES];
    if (!badge) return;

    await this.userService.addBadge(userId, badgeKey);
    await this.userService.addPoints(userId, badge.points);

    await this.notificationService.sendNotification(
      userId,
      NotificationType.ACHIEVEMENT,
      'Achievement Unlocked! 🏆',
      `You've earned the "${badge.name}" badge! +${badge.points} points`,
      { badge: badgeKey, points: badge.points }
    );

    logger.info(`Badge awarded: ${badgeKey} to user ${userId}`);
  }

  private async checkFirstLogin(userId: string, currentBadges: string[]): Promise<void> {
    await this.awardBadge(userId, 'FIRST_LOGIN', currentBadges);
  }

  private async checkBookReader(userId: string, booksRead: number, currentBadges: string[]): Promise<void> {
    if (booksRead >= 10) {
      await this.awardBadge(userId, 'BOOK_READER', currentBadges);
    }
  }

  private async checkQuizMaster(userId: string, testsCompleted: number, currentBadges: string[]): Promise<void> {
    if (testsCompleted >= 25) {
      await this.awardBadge(userId, 'QUIZ_MASTER', currentBadges);
    }
  }

  private async checkStreakAchievements(userId: string, streakDays: number, currentBadges: string[]): Promise<void> {
    if (streakDays >= 30 && !currentBadges.includes('STREAK_MONTH')) {
      await this.awardBadge(userId, 'STREAK_MONTH', currentBadges);
    } else if (streakDays >= 7 && !currentBadges.includes('STREAK_WEEK')) {
      await this.awardBadge(userId, 'STREAK_WEEK', currentBadges);
    }
  }

  private async checkTopScorer(userId: string, score: number, currentBadges: string[]): Promise<void> {
    if (score >= 90) {
      // Check if user has scored 90% or above in 5 quizzes
      // This would require tracking quiz scores in the database
      // For now, we'll award the badge based on the current score
      await this.awardBadge(userId, 'TOP_SCORER', currentBadges);
    }
  }
}
