#!/bin/bash

# Fix the last 10 TypeScript errors
echo "🔧 Fixing the last 10 TypeScript errors..."

cd ~/elimuconnect/api || { echo "❌ API directory not found"; exit 1; }

# Fix 1: Add default exports to User and School models
echo "🔧 Adding default exports to User model..."
cat >> src/models/User.ts << 'EOF'

export default User;
EOF

echo "🔧 Adding default export to School model..."
cat >> src/models/School.ts << 'EOF'

export default School;
EOF

# Fix 2: Fix models index to remove problematic default exports
echo "🔧 Fixing models index..."
cat > src/models/index.ts << 'EOF'
export { User, UserDocument } from './User';
export { School, SchoolDocument } from './School';
export { PastPaper, PastPaperDocument } from './PastPaper';
export { Quiz, QuizDocument } from './Quiz';
export { StudyGroup, StudyGroupDocument } from './StudyGroup';
EOF

# Fix 3: Fix user routes imports and requireEmailVerification usage
echo "🔧 Fixing user routes..."
cat > src/routes/users.routes.ts << 'EOF'
import { Router } from 'express';
import { authMiddleware, requireEmailVerification } from '../middleware/auth';
import { userController } from '../controllers/user.controller';

const router = Router();

// Profile routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);

// Settings routes
router.put(
  '/settings',
  authMiddleware,
  requireEmailVerification,
  userController.updateSettings
);

router.put(
  '/preferences',
  authMiddleware,
  requireEmailVerification,
  userController.updatePreferences
);

// Security routes
router.put(
  '/change-password',
  authMiddleware,
  requireEmailVerification,
  userController.changePassword
);

router.delete(
  '/account',
  authMiddleware,
  requireEmailVerification,
  userController.deleteAccount
);

// Public user routes
router.get('/user/:id', userController.getUserById);

// Search routes
router.get(
  '/search',
  authMiddleware,
  userController.searchUsers
);

// Social routes
router.post(
  '/users/:id/block',
  authMiddleware,
  requireEmailVerification,
  userController.blockUser
);

router.delete(
  '/users/:id/block',
  authMiddleware,
  requireEmailVerification,
  userController.unblockUser
);

router.post(
  '/users/:id/follow',
  authMiddleware,
  requireEmailVerification,
  userController.followUser
);

router.delete(
  '/users/:id/follow',
  authMiddleware,
  requireEmailVerification,
  userController.unfollowUser
);

router.get('/followers', authMiddleware, userController.getFollowers);

router.get('/following', authMiddleware, userController.getFollowing);

export default router;
EOF

# Fix 4: Fix achievement service notification call
echo "🔧 Fixing achievement service..."
cat > src/services/achievement.service.ts << 'EOF'
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
EOF

echo "🧹 Cleaning build cache..."
rm -rf dist/
rm -f .tsbuildinfo

echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ BUILD SUCCESSFUL!"
    echo "🚀 All TypeScript errors have been resolved!"
    echo ""
    echo "📋 Your ElimuConnect API is now ready!"
    echo "Start the development server with:"
    echo "npm run dev"
else
    echo "❌ Build failed. Checking remaining errors..."
    npm run build 2>&1 | head -15
fi

echo ""
echo "📋 Final fix completed!"
echo "✅ Fixed: Model default exports"
echo "✅ Fixed: User routes imports and structure"
echo "✅ Fixed: Achievement service notification calls"
