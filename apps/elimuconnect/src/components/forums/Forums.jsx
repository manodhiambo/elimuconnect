import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Pin,
  Clock,
  User,
  Tag,
  TrendingUp,
  MessageSquare,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Forums = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dummy data for demonstration
  const dummyCategories = [
    { id: 'all', name: 'All Categories', color: 'gray', count: 150 },
    { id: 'mathematics', name: 'Mathematics', color: 'blue', count: 45 },
    { id: 'science', name: 'Science', color: 'green', count: 38 },
    { id: 'english', name: 'English', color: 'purple', count: 22 },
    { id: 'kiswahili', name: 'Kiswahili', color: 'orange', count: 18 },
    { id: 'general', name: 'General Discussion', color: 'indigo', count: 27 }
  ];

  const dummyPosts = [
    {
      id: 1,
      title: 'Help with Quadratic Equations',
      content: 'I\'m struggling with solving quadratic equations using the quadratic formula. Can someone explain the steps clearly?',
      author: {
        name: 'Mary Wanjiku',
        avatar: '/api/placeholder/40/40',
        role: 'Student',
        school: 'Alliance Girls High School'
      },
      category: 'mathematics',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      likes: 12,
      dislikes: 1,
      replies: 8,
      views: 156,
      isPinned: false,
      isAnswered: true,
      tags: ['algebra', 'equations', 'form-3']
    },
    {
      id: 2,
      title: 'Best Study Techniques for Biology',
      content: 'What are the most effective ways to memorize biological processes and terminology? I have KCSE coming up and need better study methods.',
      author: {
        name: 'John Kamau',
        avatar: '/api/placeholder/40/40',
        role: 'Student',
        school: 'Starehe Boys Centre'
      },
      category: 'science',
      createdAt: '2024-01-14T16:45:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      likes: 28,
      dislikes: 0,
      replies: 15,
      views: 245,
      isPinned: true,
      isAnswered: false,
      tags: ['biology', 'study-tips', 'kcse']
    },
    {
      id: 3,
      title: 'Grammar Rules in English Essays',
      content: 'Can a teacher help clarify the rules for using semicolons and colons in formal essay writing?',
      author: {
        name: 'Grace Akinyi',
        avatar: '/api/placeholder/40/40',
        role: 'Student',
        school: 'Loreto High School Limuru'
      },
      category: 'english',
      createdAt: '2024-01-14T11:20:00Z',
      updatedAt: '2024-01-14T18:30:00Z',
      likes: 7,
      dislikes: 0,
      replies: 5,
      views: 89,
      isPinned: false,
      isAnswered: true,
      tags: ['grammar', 'writing', 'essays']
    }
  ];

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setCategories(dummyCategories);
        setPosts(dummyPosts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch forum data:', error);
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'popular':
        return (b.likes + b.replies) - (a.likes + a.replies);
      case 'unanswered':
        return a.isAnswered - b.isAnswered;
      default:
        return 0;
    }
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = (now - postTime) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || 'gray';
  };

  const PostCard = ({ post }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                post.author.role === 'Teacher' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {post.author.role}
              </span>
              {post.isPinned && (
                <Pin className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {post.author.school} • {formatTimeAgo(post.updatedAt)}
            </div>
          </div>
        </div>
        
        <span className={`text-xs px-2 py-1 rounded bg-${getCategoryColor(post.category)}-100 text-${getCategoryColor(post.category)}-800 dark:bg-${getCategoryColor(post.category)}-900 dark:text-${getCategoryColor(post.category)}-200`}>
          {categories.find(cat => cat.id === post.category)?.name}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{post.replies} replies</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{post.views} views</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {post.isAnswered && (
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
              ✓ Answered
            </span>
          )}
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
            View Discussion
          </button>
        </div>
      </div>
    </div>
  );

  const CreatePostModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Post
            </h2>
            <button
              onClick={() => setShowCreatePost(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                {categories.filter(cat => cat.id !== 'all').map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="What's your question or topic?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <textarea
                rows={6}
                placeholder="Provide details about your question or start a discussion..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                placeholder="Add tags separated by commas (e.g., algebra, form-3, help)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Discussion Forums - ElimuConnect</title>
        <meta name="description" content="Connect and discuss with students and teachers across Kenya" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Discussion Forums 💬
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connect, learn, and grow together with the ElimuConnect community
              </p>
            </div>
            
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Post</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {category.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Posts</span>
                    <span className="font-medium text-gray-900 dark:text-white">1,250</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
                    <span className="font-medium text-gray-900 dark:text-white">340</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Today's Posts</span>
                    <span className="font-medium text-gray-900 dark:text-white">28</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search and Filter Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="unanswered">Unanswered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Posts */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="text-center py-16">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No discussions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Be the first to start a discussion in this category!
                  </p>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create First Post
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && <CreatePostModal />}
    </>
  );
};

export default Forums;
