import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { forumAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const DiscussionForum = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: discussionsData, isLoading } = useQuery({
    queryKey: ['discussions', activeTab, selectedCategory],
    queryFn: async () => {
      const response = await forumAPI.getDiscussions({
        sortBy: activeTab,
        category: selectedCategory === 'all' ? '' : selectedCategory,
      });
      return response.data;
    },
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: '💬', color: 'bg-blue-500' },
    { id: 'mathematics', name: 'Mathematics', icon: '🔢', color: 'bg-purple-500' },
    { id: 'science', name: 'Science', icon: '🔬', color: 'bg-green-500' },
    { id: 'english', name: 'English', icon: '📖', color: 'bg-red-500' },
    { id: 'kiswahili', name: 'Kiswahili', icon: '🇰🇪', color: 'bg-orange-500' },
    { id: 'general', name: 'General Discussion', icon: '💭', color: 'bg-indigo-500' },
    { id: 'homework', name: 'Homework Help', icon: '📝', color: 'bg-pink-500' },
  ];

  const tabs = [
    { id: 'recent', name: 'Recent', icon: '🕒' },
    { id: 'popular', name: 'Popular', icon: '🔥' },
    { id: 'unanswered', name: 'Unanswered', icon: '❓' },
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Discussion Forum
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with students and teachers, ask questions, and share knowledge
              </p>
            </div>
            <Link
              to="/forum/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Discussion</span>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Categories
              </h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white text-sm`}>
                      {category.icon}
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Forum Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Forum Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Discussions</span>
                  <span className="font-semibold text-gray-900 dark:text-white">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="font-semibold text-gray-900 dark:text-white">567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Answered Today</span>
                  <span className="font-semibold text-green-600">89</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6"
            >
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Discussions List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" text="Loading discussions..." />
                </div>
              ) : discussionsData?.discussions?.length > 0 ? (
                <div className="space-y-4">
                  {discussionsData.discussions.map((discussion, index) => (
                    <motion.div
                      key={discussion._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        {/* User Avatar */}
                        <img
                          src={discussion.author?.avatar || '/default-avatar.png'}
                          alt={discussion.author?.name}
                          className="w-12 h-12 rounded-full"
                        />

                        {/* Discussion Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                to={`/forum/discussion/${discussion._id}`}
                                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {discussion.title}
                              </Link>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  by {discussion.author?.name}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-500">
                                  {formatTimeAgo(discussion.createdAt)}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                                  {discussion.category}
                                </span>
                              </div>
                            </div>

                            {/* Vote Buttons */}
                            <div className="flex flex-col items-center space-y-1">
                              <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {discussion.votes || 0}
                              </span>
                              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Discussion Preview */}
                          <p className="text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                            {discussion.content}
                          </p>

                          {/* Tags */}
                          {discussion.tags && discussion.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {discussion.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Discussion Stats */}
                          <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.405L3 21l2.595-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                              </svg>
                              <span>{discussion.replyCount || 0} replies</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>{discussion.views || 0} views</span>
                            </span>
                            {discussion.lastReply && (
                              <span>
                                Last reply {formatTimeAgo(discussion.lastReply.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl">💬</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                    No discussions found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Be the first to start a discussion in this category
                  </p>
                  <Link
                    to="/forum/new"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Discussion
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
