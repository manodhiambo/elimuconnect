import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch teacher dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/teacher');
      return response.data;
    },
  });

  const quickActions = [
    { title: 'Upload Materials', icon: '📤', path: '/upload', color: 'bg-blue-500' },
    { title: 'Manage Classes', icon: '👥', path: '/classes', color: 'bg-green-500' },
    { title: 'Create Quiz', icon: '📝', path: '/quiz/create', color: 'bg-purple-500' },
    { title: 'Grade Papers', icon: '✅', path: '/grading', color: 'bg-orange-500' },
    { title: 'View Forum', icon: '💬', path: '/forum', color: 'bg-indigo-500' },
    { title: 'Analytics', icon: '📊', path: '/analytics', color: 'bg-pink-500' },
  ];

  const recentActivities = [
    { type: 'upload', title: 'Uploaded Math Quiz 3', time: '2 hours ago', icon: '📤' },
    { type: 'grade', title: 'Graded 15 assignments', time: '4 hours ago', icon: '✅' },
    { type: 'message', title: '3 new student messages', time: '6 hours ago', icon: '💬' },
    { type: 'forum', title: 'Replied to discussion', time: '1 day ago', icon: '💭' },
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
          className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {user?.profile?.firstName}! 👨‍🏫
              </h1>
              <p className="text-green-100 mb-4">
                Ready to inspire learning today? {currentTime.toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👥</span>
                  <span>{dashboardData?.studentCount || 0} Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📚</span>
                  <span>{dashboardData?.classCount || 0} Classes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📝</span>
                  <span>{dashboardData?.assignmentCount || 0} Assignments</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-green-100">Current Time</p>
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
                Quick Actions
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
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {action.title}
                      </h3>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Today's Classes
              </h2>
              <div className="space-y-4">
                {dashboardData?.todaysClasses?.length > 0 ? (
                  dashboardData.todaysClasses.map((classItem, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📖</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {classItem.subject} - {classItem.class}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {classItem.time} • {classItem.students} students
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/classes/${classItem.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        View Class
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="text-6xl">📅</span>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      No classes scheduled for today
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-xl">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {activity.title}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pending Tasks */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Pending Tasks
              </h2>
              <div className="space-y-3">
                {dashboardData?.pendingTasks?.length > 0 ? (
                  dashboardData.pendingTasks.map((task, index) => (
                    <div
                      key={index}
                      className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg"
                    >
                      <p className="font-medium text-orange-800 dark:text-orange-200">
                        {task.title}
                      </p>
                      <p className="text-orange-600 dark:text-orange-300 text-sm">
                        Due: {task.dueDate}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <span className="text-4xl">✅</span>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      All caught up!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Class Performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Class Performance
              </h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${(dashboardData?.classAverage || 75) * 2.51} 251`}
                        className="text-green-600"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dashboardData?.classAverage || 75}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Class Average</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardData?.topPerformers || 12}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Top Performers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {dashboardData?.needingHelp || 3}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Need Help</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Teaching Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-6 text-white"
            >
              <div className="text-center">
                <span className="text-4xl">💡</span>
                <h2 className="text-xl font-bold mt-2">
                  Teaching Tip of the Day
                </h2>
                <p className="text-purple-100 text-sm mt-2">
                  "Use interactive quizzes to keep students engaged and assess understanding in real-time."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
