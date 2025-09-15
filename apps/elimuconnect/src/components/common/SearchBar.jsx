import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

const SearchBar = ({ placeholder = "Search books, papers, discussions..." }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['globalSearch', query],
    queryFn: async () => {
      if (query.length < 2) return { results: [] };
      const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
      return response.data;
    },
    enabled: query.length >= 2,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!searchResults?.results?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(searchResults.results[selectedIndex]);
        } else if (query.trim()) {
          navigate(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'book':
        navigate(`/library/book/${result.id}`);
        break;
      case 'paper':
        navigate(`/papers/${result.id}`);
        break;
      case 'discussion':
        navigate(`/forum/discussion/${result.id}`);
        break;
      case 'user':
        navigate(`/profile/${result.id}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const getResultIcon = (type) => {
    const icons = {
      book: '📚',
      paper: '📄',
      discussion: '💬',
      user: '👤',
      school: '🏫',
    };
    return icons[type] || '🔍';
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');
  };

  return (
    <div className="relative w-full max-w-lg" ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
          >
            {searchResults?.results?.length > 0 ? (
              <>
                {searchResults.results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                      selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getResultIcon(result.type)}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          <span dangerouslySetInnerHTML={{ 
                            __html: highlightMatch(result.title, query) 
                          }} />
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.type === 'book' && `by ${result.author}`}
                          {result.type === 'paper' && `${result.subject} • ${result.year}`}
                          {result.type === 'discussion' && `in ${result.category}`}
                          {result.type === 'user' && result.role}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {result.type}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      navigate(`/search?q=${encodeURIComponent(query)}`);
                      setIsOpen(false);
                    }}
                    className="w-full text-left text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    See all results for "{query}"
                  </button>
                </div>
              </>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
