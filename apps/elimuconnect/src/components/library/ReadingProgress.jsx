import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { userAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ReadingProgress = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [timeFilter, setTimeFilter] = useState('week');

  // Fetch reading progress data
  const { data: progressData, isLoading } = useQuery({
    queryKey: ['readingProgress', timeFilter],
    queryFn: async () => {
      const response = await userAPI.getProgress();
      return response.data;
    },
  });

  const timeFilters = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'year', name: 'This Year' },
    { id: 'all', name: 'All Time' },
  ];

  const getReadingStreakDays = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return progressData?.readingDays?.filter(day => 
      new Date(day.date) >= lastWeek && new Date(day.date) <= today
    ).length || 0;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCurrentStreakDays = () => {
    return progressData?.currentStreak || 0;
  };

  const getBestStreakDays = () => {
    return progressData?.bestStreak || 0;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reading Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your reading habits and achievements
          </p>
        </motion.div>

        {/* Time Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-2">
            {timeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Books Read</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progressData?.booksCompleted || 0}
                </p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Reading Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(progressData?.totalReadingTime || 0)}
                </p>
              </div>
              <div className="text-3xl">⏱️</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getCurrentStreakDays()} days
                </p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Best Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getBestStreakDays()} days
                </p>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Currently Reading */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Currently Reading
              </h2>
              
              {progressData?.currentlyReading?.length > 0 ? (
                <div className="space-y-4">
                  {progressData.currentlyReading.map((book, index) => (
                    <div key={book._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">📖</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{book.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">by {book.author}</p>
                        
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Progress</span>
                            <span className={`font-medium ${getProgressColor(book.progress)}`}>
                              {Math.round(book.progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to={`/library/read/${book._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Continue
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl">📚</span>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    No books in progress. Start reading something new!
                  </p>
                  <Link
                    to="/library"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Library
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Reading Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Reading Activity
              </h2>
              
              {/* Simple activity heatmap */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (34 - i));
                  const dayActivity = progressData?.readingDays?.find(
                    day => new Date(day.date).toDateString() === date.toDateString()
                  );
                  const intensity = dayActivity ? Math.min(dayActivity.minutes / 60, 1) : 0;
                  
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        intensity === 0 
                          ? 'bg-gray-100 dark:bg-gray-700' 
                          : intensity < 0.3 
                          ? 'bg-green-200 dark:bg-green-800' 
                          : intensity < 0.7 
                          ? 'bg-green-400 dark:bg-green-600' 
                          : 'bg-green-600 dark:bg-green-400'
                      }`}
                      title={`${date.toDateString()}: ${dayActivity ? formatTime(dayActivity.minutes) : '0m'}`}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
                  <div className="w-3 h-3 bg-green-400 dark:bg-green-600 rounded"></div>
                  <div className="w-3 h-3 bg-green-600 dark:bg-green-400 rounded"></div>
                </div>
                <span>More</span>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Reading Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Reading Goals
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Daily Goal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {progressData?.todayReading || 0} / 30 min
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((progressData?.todayReading || 0) / 30 * 100, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Weekly Goal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {progressData?.weeklyReading || 0} / 210 min
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((progressData?.weeklyReading || 0) / 210 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Recent Achievements
              </h2>
              
              <div className="space-y-3">
                {progressData?.recentAchievements?.length > 0 ? (
                  progressData.recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                          {achievement.name}
                        </p>
                        <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <span className="text-4xl">🏆</span>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      Keep reading to earn achievements!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Reading Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 text-white"
            >
              <h2 className="text-xl font-bold mb-4">Reading Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Average Session</span>
                  <span className="font-semibold">
                    {formatTime(progressData?.averageSession || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pages Read</span>
                  <span className="font-semibold">{progressData?.totalPages || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Favorite Subject</span>
                  <span className="font-semibold">{progressData?.favoriteSubject || 'N/A'}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingProgress;
