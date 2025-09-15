import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Trophy,
  Star,
  Medal,
  Crown,
  Target,
  Flame,
  Zap,
  BookOpen,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  Lock,
  Unlock,
  Share2,
  Download,
  Filter,
  Search,
  Grid,
  List,
  Eye,
  Gift,
  Sparkles,
  Heart,
  Shield,
  Diamond,
  Gem,
  Badge,
  Hexagon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

const Achievements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [userStats, setUserStats] = useState({});

  // Load achievements data
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const [achievementsRes, earnedRes, categoriesRes, statsRes] = await Promise.all([
          api.get('/achievements/all'),
          api.get('/achievements/earned'),
          api.get('/achievements/categories'),
          api.get('/achievements/stats')
        ]);

        setAchievements(achievementsRes.data);
        setEarnedAchievements(earnedRes.data);
        setCategories(categoriesRes.data);
        setUserStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load achievements:', error);
        setLoading(false);
      }
    };

    loadAchievements();
  }, []);

  const getAchievementIcon = (type, tier = 'bronze') => {
    const iconProps = {
      className: `w-6 h-6 ${
        tier === 'diamond' ? 'text-cyan-500' :
        tier === 'platinum' ? 'text-purple-500' :
        tier === 'gold' ? 'text-yellow-500' :
        tier === 'silver' ? 'text-gray-400' :
        'text-amber-600'
      }`
    };

    switch (type) {
      case 'academic': return <BookOpen {...iconProps} />;
      case 'streak': return <Flame {...iconProps} />;
      case 'speed': return <Zap {...iconProps} />;
      case 'social': return <Users {...iconProps} />;
      case 'time': return <Clock {...iconProps} />;
      case 'special': return <Crown {...iconProps} />;
      case 'milestone': return <Target {...iconProps} />;
      case 'perfect': return <Star {...iconProps} />;
      case 'leadership': return <Shield {...iconProps} />;
      case 'collaboration': return <Heart {...iconProps} />;
      default: return <Award {...iconProps} />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'diamond': return 'from-cyan-500 to-blue-600';
      case 'platinum': return 'from-purple-500 to-pink-600';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-amber-500 to-orange-600';
    }
  };

  const getTierBadge = (tier) => {
    const badges = {
      diamond: { icon: Diamond, color: 'bg-cyan-500' },
      platinum: { icon: Gem, color: 'bg-purple-500' },
      gold: { icon: Crown, color: 'bg-yellow-500' },
      silver: { icon: Medal, color: 'bg-gray-400' },
      bronze: { icon: Award, color: 'bg-amber-600' }
    };
    
    const { icon: Icon, color } = badges[tier] || badges.bronze;
    return <Icon className={`w-4 h-4 text-white`} />;
  };

  const isAchievementEarned = (achievementId) => {
    return earnedAchievements.some(earned => earned.achievementId === achievementId);
  };

  const getEarnedDate = (achievementId) => {
    const earned = earnedAchievements.find(e => e.achievementId === achievementId);
    return earned?.earnedAt;
  };

  const getProgress = (achievement) => {
    if (!achievement.requirements) return 0;
    const userValue = userStats[achievement.requirements.type] || 0;
    return Math.min((userValue / achievement.requirements.value) * 100, 100);
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const earnedCount = achievements.filter(a => isAchievementEarned(a.id)).length;
  const totalPoints = earnedAchievements.reduce((sum, earned) => sum + (earned.points || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600 mb-6">
          Celebrate your learning milestones and unlock new badges
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">{earnedCount}</div>
            <div className="text-blue-100 text-sm">Earned</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-green-100 text-sm">Total</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-purple-100 text-sm">Points</div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
            <div className="text-2xl font-bold">{Math.round((earnedCount / achievements.length) * 100)}%</div>
            <div className="text-yellow-100 text-sm">Complete</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Achievements Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const isEarned = isAchievementEarned(achievement.id);
            const progress = getProgress(achievement);
            const earnedDate = getEarnedDate(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-all ${
                  isEarned ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                }`}
                onClick={() => setSelectedAchievement(achievement)}
              >
                {/* Achievement Header */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${
                    isEarned ? getTierColor(achievement.tier) : 'from-gray-300 to-gray-400'
                  } mb-3 relative`}>
                    {isEarned ? (
                      getAchievementIcon(achievement.type, achievement.tier)
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                    
                    {/* Tier Badge */}
                    {isEarned && (
                      <div className={`absolute -top-1 -right-1 w-6 h-6 ${
                        achievement.tier === 'diamond' ? 'bg-cyan-500' :
                        achievement.tier === 'platinum' ? 'bg-purple-500' :
                        achievement.tier === 'gold' ? 'bg-yellow-500' :
                        achievement.tier === 'silver' ? 'bg-gray-400' :
                        'bg-amber-600'
                      } rounded-full flex items-center justify-center`}>
                        {getTierBadge(achievement.tier)}
                      </div>
                    )}
                  </div>

                  <h3 className={`font-semibold mb-1 ${
                    isEarned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className={`text-sm ${
                    isEarned ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {achievement.description}
                  </p>
                </div>

                {/* Progress Bar */}
                {!isEarned && achievement.requirements && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {userStats[achievement.requirements.type] || 0} / {achievement.requirements.value}
                    </div>
                  </div>
                )}

                {/* Achievement Footer */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-gray-600">{achievement.points} pts</span>
                  </div>
                  
                  {isEarned ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">
                        {formatDistanceToNow(new Date(earnedDate), { addSuffix: true })}
                      </span>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs">
                      {achievement.rarity}
                    </div>
                  )}
                </div>

                {/* Special Effects for Rare Achievements */}
                {isEarned && achievement.tier === 'diamond' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-10 rounded-lg"></div>
                    <Sparkles className="absolute top-2 right-2 w-4 h-4 text-cyan-500 animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          {filteredAchievements.map((achievement, index) => {
            const isEarned = isAchievementEarned(achievement.id);
            const progress = getProgress(achievement);
            const earnedDate = getEarnedDate(achievement.id);

            return (
              <div
                key={achievement.id}
                className={`flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer ${
                  index !== filteredAchievements.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                onClick={() => setSelectedAchievement(achievement)}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${
                  isEarned ? getTierColor(achievement.tier) : 'from-gray-300 to-gray-400'
                } flex items-center justify-center relative`}>
                  {isEarned ? (
                    getAchievementIcon(achievement.type, achievement.tier)
                  ) : (
                    <Lock className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${
                        isEarned ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${
                        isEarned ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm text-gray-600">{achievement.points}</span>
                        </div>
                        {isEarned ? (
                          <div className="text-xs text-green-600">Earned</div>
                        ) : (
                          <div className="text-xs text-gray-400">{Math.round(progress)}%</div>
                        )}
                      </div>
                      
                      {isEarned && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for List View */}
                  {!isEarned && achievement.requirements && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${
                  isAchievementEarned(selectedAchievement.id) 
                    ? getTierColor(selectedAchievement.tier) 
                    : 'from-gray-300 to-gray-400'
                } mb-4 relative`}>
                  {isAchievementEarned(selectedAchievement.id) ? (
                    getAchievementIcon(selectedAchievement.type, selectedAchievement.tier)
                  ) : (
                    <Lock className="w-8 h-8 text-white" />
                  )}
                  
                  {isAchievementEarned(selectedAchievement.id) && (
                    <div className={`absolute -top-2 -right-2 w-8 h-8 ${
                      selectedAchievement.tier === 'diamond' ? 'bg-cyan-500' :
                      selectedAchievement.tier === 'platinum' ? 'bg-purple-500' :
                      selectedAchievement.tier === 'gold' ? 'bg-yellow-500' :
                      selectedAchievement.tier === 'silver' ? 'bg-gray-400' :
                      'bg-amber-600'
                    } rounded-full flex items-center justify-center`}>
                      {getTierBadge(selectedAchievement.tier)}
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedAchievement.title}
                </h2>
                <p className="text-gray-600 mb-4">{selectedAchievement.description}</p>

                {/* Achievement Details */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {selectedAchievement.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Rarity</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAchievement.rarity}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Points</span>
                    <span className="text-sm font-medium text-yellow-600">
                      {selectedAchievement.points}
                    </span>
                  </div>

                  {selectedAchievement.requirements && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800 font-medium mb-1">Requirements</div>
                      <div className="text-sm text-blue-700">
                        {selectedAchievement.requirements.description}
                      </div>
                      {!isAchievementEarned(selectedAchievement.id) && (
                        <div className="mt-2">
                          <div className="text-xs text-blue-600 mb-1">
                            Progress: {Math.round(getProgress(selectedAchievement))}%
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgress(selectedAchievement)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isAchievementEarned(selectedAchievement.id) && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-800 font-medium mb-1">Earned</div>
                      <div className="text-sm text-green-700">
                        {formatDistanceToNow(new Date(getEarnedDate(selectedAchievement.id)), { addSuffix: true })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Close
                </button>
                {isAchievementEarned(selectedAchievement.id) && (
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-600">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Progress Summary */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievement Journey</h3>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{earnedCount} / {achievements.length} completed</span>
            </div>
            <div className="w-full bg-white rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(earnedCount / achievements.length) * 100}%` }}
              ></div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {['bronze', 'silver', 'gold', 'diamond'].map((tier) => {
                const tierCount = earnedAchievements.filter(e => 
                  achievements.find(a => a.id === e.achievementId)?.tier === tier
                ).length;
                
                return (
                  <div key={tier} className="text-center">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getTierColor(tier)} flex items-center justify-center mx-auto mb-1`}>
                      {getTierBadge(tier)}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{tierCount}</div>
                    <div className="text-xs text-gray-600 capitalize">{tier}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
