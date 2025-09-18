import { authMiddleware } from "./../middleware";
import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validationMiddleware } from '../middleware/validation.middleware';
import { 
  analyticsQuerySchema,
  progressTrackingSchema,
  customEventSchema 
} from '../schemas/analytics.schemas';

const router = Router();
const analyticsController = new AnalyticsController();

// All routes require authentication
router.use(authMiddleware);

// User Progress Analytics
router.get('/progress/overview', analyticsController.getProgressOverview);
router.get('/progress/reading', analyticsController.getReadingProgress);
router.get('/progress/study-time', analyticsController.getStudyTimeAnalytics);
router.get('/progress/achievements', analyticsController.getAchievementProgress);

// Learning Analytics
router.get('/learning/performance', analyticsController.getLearningPerformance);
router.get('/learning/subject-breakdown', analyticsController.getSubjectBreakdown);
router.get('/learning/weak-areas', analyticsController.getWeakAreas);
router.get('/learning/improvement-trends', analyticsController.getImprovementTrends);

// Engagement Analytics
router.get('/engagement/daily-activity', analyticsController.getDailyActivity);
router.get('/engagement/session-duration', analyticsController.getSessionDuration);
router.get('/engagement/feature-usage', analyticsController.getFeatureUsage);
router.get('/engagement/login-patterns', analyticsController.getLoginPatterns);

// Content Analytics
router.get('/content/most-accessed', analyticsController.getMostAccessedContent);
router.get('/content/completion-rates', analyticsController.getCompletionRates);
router.get('/content/difficulty-analysis', analyticsController.getDifficultyAnalysis);
router.get('/content/popular-subjects', analyticsController.getPopularSubjects);

// Social Analytics
router.get('/social/discussion-participation', analyticsController.getDiscussionParticipation);
router.get('/social/collaboration-metrics', analyticsController.getCollaborationMetrics);
router.get('/social/peer-comparison', analyticsController.getPeerComparison);

// Custom Event Tracking
router.post('/events', 
  validationMiddleware(customEventSchema),
  analyticsController.trackCustomEvent
);

router.get('/events', 
  validationMiddleware(analyticsQuerySchema, 'query'),
  analyticsController.getCustomEvents
);

// Goal Tracking
router.get('/goals/progress', analyticsController.getGoalProgress);
router.post('/goals/track', 
  validationMiddleware(progressTrackingSchema),
  analyticsController.trackGoalProgress
);

// Study Session Analytics
router.post('/sessions/start', analyticsController.startStudySession);
router.put('/sessions/:sessionId/end', analyticsController.endStudySession);
router.get('/sessions/history', analyticsController.getStudySessionHistory);
router.get('/sessions/statistics', analyticsController.getStudySessionStatistics);

// Performance Metrics
router.get('/performance/quiz-results', analyticsController.getQuizPerformance);
router.get('/performance/paper-attempts', analyticsController.getPaperAttemptAnalytics);
router.get('/performance/time-spent', analyticsController.getTimeSpentAnalytics);
router.get('/performance/accuracy-trends', analyticsController.getAccuracyTrends);

// Comparative Analytics
router.get('/comparison/peer-performance', analyticsController.getPeerPerformanceComparison);
router.get('/comparison/school-rankings', analyticsController.getSchoolRankings);
router.get('/comparison/subject-performance', analyticsController.getSubjectPerformanceComparison);

// Predictive Analytics
router.get('/predictions/performance-forecast', analyticsController.getPerformanceForecast);
router.get('/predictions/completion-time', analyticsController.getCompletionTimePrediction);
router.get('/predictions/difficulty-recommendations', analyticsController.getDifficultyRecommendations);

// Report Generation
router.get('/reports/progress-report', analyticsController.generateProgressReport);
router.get('/reports/performance-summary', analyticsController.generatePerformanceSummary);
router.get('/reports/weekly-summary', analyticsController.generateWeeklySummary);
router.get('/reports/monthly-summary', analyticsController.generateMonthlySummary);

// Data Export
router.get('/export/progress-data', analyticsController.exportProgressData);
router.get('/export/performance-data', analyticsController.exportPerformanceData);
router.get('/export/engagement-data', analyticsController.exportEngagementData);

// Real-time Analytics
router.get('/realtime/active-users', analyticsController.getActiveUsers);
router.get('/realtime/current-activity', analyticsController.getCurrentActivity);
router.get('/realtime/live-metrics', analyticsController.getLiveMetrics);

// Time-based Analytics
router.get('/time-analysis/peak-hours', analyticsController.getPeakStudyHours);
router.get('/time-analysis/productivity-patterns', analyticsController.getProductivityPatterns);
router.get('/time-analysis/time-distribution', analyticsController.getTimeDistribution);

// Milestone Tracking
router.get('/milestones/achieved', analyticsController.getAchievedMilestones);
router.get('/milestones/upcoming', analyticsController.getUpcomingMilestones);
router.post('/milestones/track', analyticsController.trackMilestone);

// Learning Path Analytics
router.get('/learning-path/completion', analyticsController.getLearningPathCompletion);
router.get('/learning-path/recommendations', analyticsController.getLearningPathRecommendations);
router.get('/learning-path/progress-map', analyticsController.getProgressMap);

// School/Institution Analytics (for admin users)
router.get('/institution/overview', analyticsController.getInstitutionOverview);
router.get('/institution/student-performance', analyticsController.getStudentPerformanceAnalytics);
router.get('/institution/resource-usage', analyticsController.getResourceUsageAnalytics);
router.get('/institution/engagement-metrics', analyticsController.getInstitutionEngagementMetrics);

// Dashboard Data
router.get('/dashboard/summary', analyticsController.getDashboardSummary);
router.get('/dashboard/widgets', analyticsController.getDashboardWidgets);
router.post('/dashboard/custom-widget', analyticsController.createCustomWidget);

// Advanced Analytics
router.get('/advanced/cohort-analysis', analyticsController.getCohortAnalysis);
router.get('/advanced/retention-analysis', analyticsController.getRetentionAnalysis);
router.get('/advanced/funnel-analysis', analyticsController.getFunnelAnalysis);

export default router;
