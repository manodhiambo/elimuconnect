import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Download, 
  Heart,
  Star,
  Grid,
  List
} from 'lucide-react';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'all', name: 'All Books' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'english', name: 'English' },
    { id: 'kiswahili', name: 'Kiswahili' },
    { id: 'history', name: 'History' },
    { id: 'geography', name: 'Geography' }
  ];

  // Dummy data for demonstration
  const dummyBooks = [
    {
      id: 1,
      title: 'Mathematics Form 2',
      author: 'Kenya Literature Bureau',
      category: 'mathematics',
      level: 'Secondary',
      rating: 4.5,
      downloads: 1200,
      thumbnail: '/api/placeholder/200/280',
      description: 'Comprehensive mathematics textbook for Form 2 students'
    },
    {
      id: 2,
      title: 'Biology Form 3',
      author: 'Longhorn Publishers',
      category: 'science',
      level: 'Secondary',
      rating: 4.3,
      downloads: 980,
      thumbnail: '/api/placeholder/200/280',
      description: 'Advanced biology concepts for Form 3 students'
    },
    {
      id: 3,
      title: 'English Class 8',
      author: 'Oxford University Press',
      category: 'english',
      level: 'Primary',
      rating: 4.7,
      downloads: 1500,
      thumbnail: '/api/placeholder/200/280',
      description: 'English language skills for Class 8 students'
    }
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setBooks(dummyBooks);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const BookCard = ({ book }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
        {book.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {book.author}
      </p>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {book.rating}
          </span>
        </div>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
          {book.level}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
          <BookOpen className="h-4 w-4" />
          <span>Read</span>
        </button>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-red-500">
            <Heart className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-blue-500">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const BookListItem = ({ book }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex items-center space-x-4">
      <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
        <BookOpen className="h-6 w-6 text-gray-400" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {book.author}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {book.description}
        </p>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {book.rating}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {book.downloads} downloads
          </span>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
          Read
        </button>
        <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Download
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Digital Library - ElimuConnect</title>
        <meta name="description" content="Access thousands of educational books and resources" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Digital Library 📚
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Discover and access educational resources from top publishers
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search books, authors, subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Books Grid/List */}
              {filteredBooks.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No books found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                    : 'space-y-4'
                }>
                  {filteredBooks.map(book => (
                    viewMode === 'grid' 
                      ? <BookCard key={book.id} book={book} />
                      : <BookListItem key={book.id} book={book} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Library;
