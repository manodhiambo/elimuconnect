import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { papersAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const RevisionMaterials = () => {
  const { t } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [materialType, setMaterialType] = useState('all');

  // Fetch revision materials
  const { data: materialsData, isLoading, error } = useQuery({
    queryKey: ['revisionMaterials', selectedSubject, selectedLevel, materialType],
    queryFn: async () => {
      const response = await papersAPI.getRevisionMaterials(selectedSubject);
      let data = response.data.materials || [];
      
      // Filter by level
      if (selectedLevel) {
        data = data.filter(material => material.level === selectedLevel);
      }
      
      // Filter by material type
      if (materialType !== 'all') {
        data = data.filter(material => material.type === materialType);
      }
      
      return { materials: data };
    },
  });

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Science', 'Biology', 'Chemistry', 
    'Physics', 'Geography', 'History', 'Computer Studies', 'Business Studies'
  ];

  const levels = ['Primary', 'Secondary'];
  
  const materialTypes = [
    { id: 'all', name: 'All Materials', icon: '📚' },
    { id: 'notes', name: 'Study Notes', icon: '📝' },
    { id: 'flashcards', name: 'Flashcards', icon: '🗂️' },
    { id: 'mindmaps', name: 'Mind Maps', icon: '🧠' },
    { id: 'summaries', name: 'Summaries', icon: '📋' },
    { id: 'practice', name: 'Practice Questions', icon: '❓' },
    { id: 'videos', name: 'Video Tutorials', icon: '🎥' },
  ];

  const getMaterialIcon = (type) => {
    const typeObj = materialTypes.find(t => t.id === type);
    return typeObj ? typeObj.icon : '📄';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
            Revision Materials
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access study notes, flashcards, mind maps, and practice materials
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Material Type
              </label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {materialTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Material Types Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8"
        >
          {materialTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setMaterialType(type.id)}
              className={`p-4 rounded-xl text-center transition-all duration-200 ${
                materialType === type.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-xs font-medium">{type.name}</div>
            </button>
          ))}
        </motion.div>

        {/* Materials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading materials..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="text-6xl">📚</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                Error loading materials
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Please try again later
              </p>
            </div>
          ) : materialsData?.materials?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materialsData.materials.map((material, index) => (
                <motion.div
                  key={material._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Material Header */}
                  <div className="relative h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 p-4">
                    <div className="flex items-center justify-between h-full">
                      <div className="text-4xl">{getMaterialIcon(material.type)}</div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                          {material.difficulty || 'Medium'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Material Content */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {material.title}
                    </h3>
                    
                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{material.subject}</span>
                      <span>•</span>
                      <span>{material.level}</span>
                      {material.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(material.duration)}</span>
                        </>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {material.description}
                    </p>

                    {/* Tags */}
                    {material.tags && material.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {material.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {material.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{material.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <span>👁️ {material.views || 0}</span>
                        <span>⭐ {material.rating || 0}/5</span>
                      </div>
                      <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/materials/${material._id}`}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                      >
                        Study Now
                      </Link>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                        Save
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl">📚</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                No materials found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
                Try adjusting your filters or check back later for new materials
              </p>
              <Link
                to="/papers"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Past Papers
              </Link>
            </div>
          )}
        </motion.div>

        {/* Study Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Study Tips for Effective Revision</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h3 className="font-semibold mb-2">Active Learning</h3>
              <p className="text-green-100 text-sm">
                Use flashcards and practice questions to actively engage with the material
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⏰</div>
              <h3 className="font-semibold mb-2">Spaced Repetition</h3>
              <p className="text-green-100 text-sm">
                Review materials at increasing intervals to improve long-term retention
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Focus Sessions</h3>
              <p className="text-green-100 text-sm">
                Study in focused 25-30 minute sessions with short breaks between
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RevisionMaterials;
