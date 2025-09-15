import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Download,
  Share2,
  RotateCcw,
  BookOpen,
  Users,
  Star,
  Calendar,
  Filter,
  Eye,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ResultsAnalysis = () => {
  const { quizId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!results);
  const [analytics, setAnalytics] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [currentView, setCurrentView] = useState('overview'); // overview, detailed, analytics
  const [comparing, setComparing] = useState(false);
  const [classAverage, setClassAverage] = useState(null);

  // Load results if not passed via state
  useEffect(() => {
    const loadResults = async () => {
      if (!results) {
        try {
          const response = await api.get(`/quiz/${quizId}/results`);
          setResults(response.data);
        } catch (error) {
          console.error('Failed to load results:', error);
        }
      }
      setLoading(false);
    };

    loadResults();
  }, [quizId, results]);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [analyticsRes, classRes] = await Promise.all([
          api.get(`/quiz/${quizId}/analytics/${user.id}`),
          api.get(`/quiz/${quizId}/class-average`)
        ]);
        
        setAnalytics(analyticsRes.data);
        setClassAverage(classRes.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    if (results && user) {
      loadAnalytics();
    }
  }, [quizId, results, user]);

  const toggleQuestionExpansion = (questionIndex) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionIndex)) {
      newExpanded.delete(questionIndex);
    } else {
      newExpanded.add(questionIndex);
    }
    setExpandedQuestions(newExpanded);
  };

  const downloadResults = async () => {
    try {
      const response = await api.get(`/quiz/${quizId}/results/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${results.quiz.title}_results.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download results:', error);
    }
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quiz Results: ${results.quiz.title}`,
          text: `I scored ${results.score}/${results.totalPoints} (${results.percentage}%) on this quiz!`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Results Not Found</h2>
        <p className="text-gray-600">Unable to load quiz results.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
            <p className="text-gray-600">{results.quiz.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={shareResults}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={downloadResults}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(`/quiz/${quizId}/retake`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'detailed', label: 'Detailed', icon: Eye },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`px-4 py-2 rounded-md flex items-center transition-colors ${
                currentView === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {currentView === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Main Score */}
            <div className={`col-span-2 p-6 rounded-lg border-2 ${getScoreColor(results.percentage)}`}>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {results.score}/{results.totalPoints}
                </div>
                <div className="text-2xl font-semibold mb-1">
                  {results.percentage.toFixed(1)}%
                </div>
                <div className="text-lg font-medium">
                  Grade: {getGradeFromPercentage(results.percentage)}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600">Correct</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {results.correctAnswers}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">Incorrect</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {results.incorrectAnswers}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">Time Taken</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {formatTime(results.timeSpent)}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600">Rank</span>
                  </div>
                  <span className="font-semibold text-purple-600">
                    #{results.rank || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
          {classAverage && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {results.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Your Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 mb-1">
                    {classAverage.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Class Average</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${
                    results.percentage >= classAverage.percentage 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {results.percentage >= classAverage.percentage ? '+' : ''}
                    {(results.percentage - classAverage.percentage).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Difference</div>
                </div>
              </div>
            </div>
          )}

          {/* Subject Breakdown */}
          {results.subjectBreakdown && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
              <div className="space-y-4">
                {Object.entries(results.subjectBreakdown).map(([subject, data]) => (
                  <div key={subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">{subject}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {data.correct}/{data.total}
                      </span>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getScoreColor(data.percentage)
                      }`}>
                        {data.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-800">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Detailed Tab */}
      {currentView === 'detailed' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question-by-Question Analysis</h3>
            
            {results.questionResults.map((questionResult, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-gray-100 text-gray-700 text-sm font-medium px-2 py-1 rounded mr-3">
                        Q{index + 1}
                      </span>
                      {questionResult.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="ml-2 text-sm text-gray-600">
                        {questionResult.points} point{questionResult.points !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-2">
                      {questionResult.question}
                    </p>
                    
                    <button
                      onClick={() => toggleQuestionExpansion(index)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {expandedQuestions.has(index) ? (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4 mr-1" />
                          Show Details
                        </>
                      )}
                    </button>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    questionResult.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {questionResult.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>

                {expandedQuestions.has(index) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Your Answer:</h5>
                        <div className={`p-3 rounded-lg ${
                          questionResult.isCorrect 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          {questionResult.userAnswer || 'No answer selected'}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Correct Answer:</h5>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          {questionResult.correctAnswer}
                        </div>
                      </div>
                    </div>
                    
                    {questionResult.explanation && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          {questionResult.explanation}
                        </div>
                      </div>
                    )}

                    {questionResult.timeSpent && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Time spent: {formatTime(questionResult.timeSpent)}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics Tab */}
      {currentView === 'analytics' && analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Performance Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">Average Score</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {analytics.averageScore.toFixed(1)}%
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Last 5 quizzes
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-600 font-medium">Improvement</span>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900">
                  +{analytics.improvement.toFixed(1)}%
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Since last month
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-600 font-medium">Study Time</span>
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {analytics.averageStudyTime}h
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  Per week
                </div>
              </div>
            </div>
          </div>

          {/* Strength & Weakness Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h4>
              <div className="space-y-3">
                {analytics.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-800 font-medium">{strength.topic}</span>
                    <span className="text-green-600 font-bold">{strength.score}%</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h4>
              <div className="space-y-3">
                {analytics.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-red-800 font-medium">{weakness.topic}</span>
                    <span className="text-red-600 font-bold">{weakness.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Study Plan Recommendations */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Study Plan</h3>
            <div className="space-y-4">
              {analytics.studyPlan.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{item.title}</h5>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {item.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResultsAnalysis;
