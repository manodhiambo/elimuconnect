import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { libraryAPI } from '../../utils/api';
import { useLanguage } from '../../contexts/LanguageContext';
import LoadingSpinner from '../common/LoadingSpinner';

const BookReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const readerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Fetch book data
  const { data: book, isLoading, error } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      const response = await libraryAPI.getBook(bookId);
      return response.data;
    },
  });

  // Fetch reading progress
  const { data: progress } = useQuery({
    queryKey: ['readingProgress', bookId],
    queryFn: async () => {
      const response = await libraryAPI.getReadingProgress(bookId);
      return response.data;
    },
    enabled: !!bookId,
  });

  // Update reading progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (progressData) => libraryAPI.updateReadingProgress(bookId, progressData),
  });

  // Set initial page from progress
  useEffect(() => {
    if (progress?.currentPage) {
      setCurrentPage(progress.currentPage);
    }
  }, [progress]);

  // Track reading time
  useEffect(() => {
    const interval = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save progress when page changes
  useEffect(() => {
    if (book && currentPage > 0) {
      const progressData = {
        currentPage,
        totalPages: book.totalPages,
        readingTime: Math.floor((Date.now() - startTimeRef.current) / 1000),
        lastRead: new Date().toISOString(),
      };
      
      updateProgressMutation.mutate(progressData);
    }
  }, [currentPage, book, updateProgressMutation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNextPage();
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, book]);

  const handleNextPage = () => {
    if (currentPage < book?.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      readerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatReadingTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading book</div>;
  if (!book) return <div>Book not found</div>;

  const progressPercentage = (currentPage / book.totalPages) * 100;

  return (
    <div 
      ref={readerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-white dark:bg-gray-900 transition-all duration-300`}
    >
      {/* Header */}
      <div className={`${isFullscreen ? 'absolute top-0 left-0 right-0 z-10' : ''} bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                {book.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                by {book.author}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Reading Progress */}
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {book.totalPages}
              </span>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{fontSize}px</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reading Time
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatReadingTime(readingTime)} this session
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Actions
                </label>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
                    Bookmark
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs">
                    Notes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Book Content */}
      <div className="flex-1 flex">
        {/* Navigation Sidebar (Desktop) */}
        <div className="hidden lg:block w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Table of Contents
          </h3>
          <div className="space-y-2">
            {book.chapters?.map((chapter, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(chapter.startPage)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  currentPage >= chapter.startPage && currentPage <= chapter.endPage
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {chapter.title}
              </button>
            ))}
          </div>
        </div>

        {/* Reading Area */}
        <div className="flex-1 flex flex-col">
          {/* Page Content */}
          <div 
            className="flex-1 p-8 overflow-y-auto"
            style={{ fontSize: `${fontSize}px` }}
          >
            <div className="max-w-4xl mx-auto">
              {book.content?.[currentPage - 1] ? (
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: book.content[currentPage - 1] }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Content not available for this page
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {book.totalPages}
                </span>
                <input
                  type="number"
                  min="1"
                  max={book.totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(1, Math.min(book.totalPages, Number(e.target.value)));
                    setCurrentPage(page);
                  }}
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= book.totalPages}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReader;
