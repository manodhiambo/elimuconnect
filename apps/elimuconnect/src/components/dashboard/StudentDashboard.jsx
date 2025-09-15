import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/student');
      return response.data;
    },
  });

  const quickActions = [
    { title: t('browseLibrary'), icon: '📚', path: '/library', color: 'bg-blue-500' },
    { title: t('pastPapers'), icon: '📄', path: '/papers', color: 'bg-green-500' },
    { title: t('joinDiscussion'), icon: '💬', path: '/forum', color: 'bg-purple-500' },
    { title: t('studyGroups'), icon: '👥', path: '/groups', color: 'bg-orange-500' },
    { title: t('messages'), icon: '✉️', path: '/messages', color: 'bg-pink-500' },
    { title: t('profile'), icon: '👤', path: '/profile', color: 'bg-indigo-500' },
  ];

  const achievements = [
    { title: t('firstLogin'), icon: '🎉', earned: true },
    { title: t('bookworm'), icon: '📖', earned: user?.progress?.booksRead >= 5 },
    { title: t('socialLearner'), icon: '👥', earned: false },
    { title: t('weekWarrior'), icon: '🏆', earned: user?.progress?.streakDays >= 7 },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {t('welcome')}, {user?.profile?.firstName}! 👋
              </h1>
              <p className="text-blue-100 mb-4">
                {t('readyToLearn')} {currentTime.toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <span>{user?.progress?.totalPoints || 0} {t('points')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔥</span>
                  <span>{user?.progress?.streakDays || 0} {t('dayStreak')}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-blue-100">{t('currentTime')}</p>
                <p className="text-2xl font-mono">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('quickActions')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className="group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200"
                    >
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                        <span className="text-2xl">{action.icon}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {action.title}
                      </h3>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('recentActivity')}
              </h2>
              <div className="space-y-4">
                {dashboardData?.recentActivity?.length > 0 ? (
                  dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <span className="text-xl">{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {activity.title}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="text-6xl">📝</span>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      {t('noRecentActivity')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Study Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('studyProgress')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                        style={{ r: 40, cx: 48, cy: 48 }}
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={`${(user?.progress?.weeklyGoalProgress || 0) * 2.51} 251`}
                        className="text-blue-600"
                        style={{ r: 40, cx: 48, cy: 48 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {user?.progress?.weeklyGoalProgress || 0}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{t('weeklyGoal')}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('booksRead')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user?.progress?.booksRead || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('testsCompleted')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user?.progress?.testsCompleted || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t('studyHours')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user?.progress?.studyHours || 0}h
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('achievements')}
              </h2>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.earned
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <span className="font-medium">{achievement.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('upcomingDeadlines')}
              </h2>
              <div className="space-y-3">
                {dashboardData?.upcomingDeadlines?.length > 0 ? (
                  dashboardData.upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <p className="font-medium text-orange-800 dark:text-orange-200">
                        {deadline.title}
                      </p>
                      <p className="text-orange-600 dark:text-orange-300 text-sm">
                        {new Date(deadline.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <span className="text-4xl">✅</span>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      {t('noUpcomingDeadlines')}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Study Streak */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white"
            >
              <div className="text-center">
                <span className="text-4xl">🔥</span>
                <h2 className="text-2xl font-bold mt-2">
                  {user?.progress?.streakDays || 0}
                </h2>
                <p className="text-orange-100">{t('dayStreak')}</p>
                <p className="text-orange-200 text-sm mt-2">
                  {t('keepItUp')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
