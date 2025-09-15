import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { libraryAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';

const Bookmarks = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch bookmarks
  const { data: bookmarks, isLoading, error } = useQuery({
    queryKey: ['bookmarks', sortBy, selectedCategory],
    queryFn: async () => {
      const response = await libraryAPI.getBookmarks();
      let data = response.data.bookmarks || [];
      
      // Filter by category
      if (selectedCategory !== 'all') {
        data = data.filter(bookmark => bookmark.book.subject.toLowerCase() === selectedCategory);
      }
      
      // Sort bookmarks
      switch (sortBy) {
        case 'recent':
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'title':
          data.sort((a, b) => a.book.title.localeCompare(b.book.title));
          break;
        case 'author':
          data.sort((a, b) => a.book.author.localeCompare(b.book.author));
          break;
        case 'progress':
          data.sort((a, b) => (b.readingProgress || 0) - (a.readingProgress || 0));
          break;
        default:
          break;
      }
      
      return { bookmarks: data };
    },
  });

  // Remove bookmark mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: (bookId) => libraryAPI.removeBookmark(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks']);
      toast.success('Bookmark removed');
    },
    onError: () => {
      toast.error('Failed to remove bookmark');
    },
  });

  const categories = [
    { id: 'all', name: 'All Subjects', count: bookmarks?.bookmarks?.length || 0 },
    { id: 'mathematics', name: 'Mathematics', count: 0 },
    { id: 'science', name: 'Science', count: 0 },
    { id: 'english', name: 'English', count: 0 },
    { id: 'kiswahili', name: 'Kiswahili', count: 0 },
  ];

  // Calculate category counts
  if (bookmarks?.bookmarks) {
    categories.forEach(category => {
      if (category.id !== 'all') {
        category.count = bookmarks.bookmarks.filter(
          bookmark => bookmark.book.subject.toLowerCase() === category.id
        ).length;
      }
    });
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleRemoveBookmark = (bookId, title) => {
    if (window.confirm(`Remove "${title}" from bookmarks?`)) {
      removeBookmarkMutation.mutate(bookId);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved books and reading materials
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
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
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Sort Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sort By
              </h2>
              <div className="space-y-2">
                {[
                  { id: 'recent', name: 'Recently Added' },
                  { id: 'title', name: 'Title A-Z' },
                  { id: 'author', name: 'Author A-Z' },
                  { id: 'progress', name: 'Reading Progress' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      sortBy === option.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading bookmarks..." />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <span className="text-6xl">📚</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                  Error loading bookmarks
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Please try again later
                </p>
              </div>
            ) : bookmarks?.bookmarks?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookmarks.bookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Book Cover */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                      {bookmark.book.coverImage ? (
                        <img
                          src={bookmark.book.coverImage}
                          alt={bookmark.book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">📖</span>
                        </div>
                      )}
                      
                      {/* Remove Bookmark Button */}
                      <button
                        onClick={() => handleRemoveBookmark(bookmark.book._id, bookmark.book.title)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>

                      {/* Reading Progress Overlay */}
                      {bookmark.readingProgress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{Math.round(bookmark.readingProgress)}% complete</span>
                            <div className="w-16 bg-gray-300 rounded-full h-1">
                              <div 
                                className="bg-green-500 h-1 rounded-full"
                                style={{ width: `${bookmark.readingProgress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {bookmark.book.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        by {bookmark.book.author}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                          {bookmark.book.subject}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(bookmark.createdAt)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/library/read/${bookmark.book._id}`}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
                        >
                          {bookmark.readingProgress > 0 ? 'Continue Reading' : 'Start Reading'}
                        </Link>
                        <Link
                          to={`/library/book/${bookmark.book._id}`}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl">🔖</span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                  No bookmarks yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                  Start bookmarking books to save them for later reading
                </p>
                <Link
                  to="/library"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Library
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
