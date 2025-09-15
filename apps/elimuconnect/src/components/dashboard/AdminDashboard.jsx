import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch admin dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin');
      return response.data;
    },
  });

  const quickActions = [
    { title: 'User Management', icon: '👥', path: '/admin/users', color: 'bg-blue-500' },
    { title: 'School Management', icon: '🏫', path: '/admin/schools', color: 'bg-green-500' },
    { title: 'Content Moderation', icon: '🛡️', path: '/admin/moderation', color: 'bg-red-500' },
    { title: 'System Analytics', icon: '📊', path: '/admin/analytics', color: 'bg-purple-500' },
    { title: 'Reports', icon: '📋', path: '/admin/reports', color: 'bg-orange-500' },
    { title: 'Settings', icon: '⚙️', path: '/admin/settings', color: 'bg-indigo-500' },
  ];

  const systemStats = [
    { label: 'Total Users', value: dashboardData?.totalUsers || '0', change: '+12%', icon: '👤' },
    { label: 'Active Schools', value: dashboardData?.activeSchools || '0', change: '+5%', icon: '🏫' },
    { label: 'Daily Active Users', value: dashboardData?.dailyActiveUsers || '0', change: '+8%', icon: '📈' },
    { label: 'Storage Used', value: dashboardData?.storageUsed || '0 GB', change: '+15%', icon: '💾' },
  ];

  const recentAlerts = [
    { type: 'warning', message: 'High server load detected', time: '5 min ago', severity: 'medium' },
    { type: 'info', message: 'Database backup completed', time: '1 hour ago', severity: 'low' },
    { type: 'error', message: 'Failed login attempts from suspicious IP', time: '2 hours ago', severity: 'high' },
    { type: 'success', message: 'System update deployed successfully', time: '4 hours ago', severity: 'low' },
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
          className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                System Overview
              </h1>
              <p className="text-red-100 mb-4">
                Welcome back, {user?.profile?.firstName}! System status dashboard for {currentTime.toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🟢</span>
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⚡</span>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🔒</span>
                  <span>Secure</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <p className="text-red-100">Server Time</p>
                <p className="text-2xl font-mono">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {systemStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-green-600 text-sm font-medium">{stat.change}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Admin Tools
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

            {/* Recent User Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Recent User Activity
              </h2>
              <div className="space-y-4">
                {dashboardData?.recentActivity?.length > 0 ? (
                  dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <span className="text-xl">{activity.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            by {activity.user} • {activity.time}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : activity.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <span className="text-6xl">📊</span>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      No recent activity to display
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* System Performance Chart Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                System Performance
              </h2>
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl">📈</span>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Performance charts will be displayed here
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* System Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                System Alerts
              </h2>
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      alert.severity === 'high'
                        ? 'bg-red-100 dark:bg-red-900'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900'
                        : 'bg-blue-100 dark:bg-blue-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${
                          alert.severity === 'high'
                            ? 'text-red-800 dark:text-red-200'
                            : alert.severity === 'medium'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'text-blue-800 dark:text-blue-200'
                        }`}>
                          {alert.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                          alert.severity === 'high'
                            ? 'text-red-600 dark:text-red-300'
                            : alert.severity === 'medium'
                            ? 'text-yellow-600 dark:text-yellow-300'
                            : 'text-blue-600 dark:text-blue-300'
                        }`}>
                          {alert.time}
                        </p>
                      </div>
                      <span className={`ml-2 w-2 h-2 rounded-full ${
                        alert.severity === 'high'
                          ? 'bg-red-500'
                          : alert.severity === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">New Registrations</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dashboardData?.newRegistrations || 24}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Pending Approvals</span>
                  <span className="font-semibold text-orange-600">
                    {dashboardData?.pendingApprovals || 7}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Support Tickets</span>
                  <span className="font-semibold text-red-600">
                    {dashboardData?.supportTickets || 3}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Content Reports</span>
                  <span className="font-semibold text-purple-600">
                    {dashboardData?.contentReports || 12}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 text-white"
            >
              <div className="text-center">
                <span className="text-4xl">🚀</span>
                <h2 className="text-xl font-bold mt-2">
                  System Health
                </h2>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>CPU Usage</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory</span>
                    <span>68%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{width: '68%'}}></div>
                  </div>
                </div>
                <p className="text-green-100 text-sm mt-4">
                  All systems operating normally
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
