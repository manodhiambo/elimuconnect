import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  CheckCircle,
  AlertTriangle,
  Zap,
  Flame,
  Trophy,
  Brain,
  Timer,
  Book,
  Lightbulb,
  ChartLine
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ProgressTracker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, semester, year
  const [viewType, setViewType] = useState('overview'); // overview, subjects, goals, analytics
  
  // Progress data
  const [overallProgress, setOverallProgress] = useState({});
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [studyStreak, setStudyStreak] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  
  // Charts data
  const [progressChart, setProgressChart] = useState([]);
  const [subjectChart, setSubjectChart] = useState([]);
  const [timeSpentChart, setTimeSpentChart] = useState([]);
  
  // Goals management
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: '',
    deadline: '',
    subject: '',
    type: 'score' // score, time, books, tests
  });

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies',
    'Physics', 'Chemistry', 'Biology', 'Geography', 'History',
    'Computer Science', 'Business Studies'
  ];

  // Load progress data
  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const [
          overallRes,
          subjectsRes,
          goalsRes,
          achievementsRes,
          streakRes,
          weeklyRes,
          metricsRes,
          chartRes
        ] = await Promise.all([
          api.get('/progress/overall'),
          api.get('/progress/subjects'),
          api.get('/progress/goals'),
          api.get('/progress/achievements'),
          api.get('/progress/streak'),
          api.get(`/progress/weekly?range=${timeRange}`),
          api.get('/progress/metrics'),
          api.get(`/progress/charts?range=${timeRange}`)
        ]);

        setOverallProgress(overallRes.data);
        setSubjectProgress(subjectsRes.data);
        setGoals(goalsRes.data);
        setAchievements(achievementsRes.data);
        setStudyStreak(streakRes.data.streakDays);
        setWeeklyStats(weeklyRes.data);
        setPerformanceMetrics(metricsRes.data);
        setProgressChart(chartRes.data.progress);
        setSubjectChart(chartRes.data.subjects);
        setTimeSpentChart(chartRes.data.timeSpent);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to load progress data:', error);
        setLoading(false);
      }
    };

    loadProgressData();
  }, [timeRange]);

  const createGoal = async () => {
    try {
      const response = await api.post('/progress/goals', newGoal);
      setGoals(prev => [...prev, response.data]);
      setShowAddGoal(false);
      setNewGoal({
        title: '',
        description: '',
        target: '',
        deadline: '',
        subject: '',
        type: 'score'
      });
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const updateGoalProgress = async (goalId, progress) => {
    try {
      await api.put(`/progress/goals/${goalId}`, { progress });
      setGoals(prev => 
        prev.map(goal => 
          goal.id === goalId ? { ...goal, progress } : goal
        )
      );
    } catch (error) {
      console.error('Failed to update goal progress:', error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSubjectIcon = (subject) => {
    const iconMap = {
      'Mathematics': '🔢',
      'English': '📖',
      'Kiswahili': '🗣️',
      'Science': '🔬',
      'Physics': '⚛️',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'Geography': '🌍',
      'History': '📜',
      'Computer Science': '💻'
    };
    return iconMap[subject] || '📚';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <TrendingUp className="w-4 h-4 text-gray-400" />;
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Tracker</h1>
          <p className="text-gray-600">Monitor your learning journey and achievements</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-8 h-8" />
            <span className="text-2xl font-bold">{studyStreak}</span>
          </div>
          <div className="text-blue-100">Day Study Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8" />
            <span className="text-2xl font-bold">{overallProgress.averageScore}%</span>
          </div>
          <div className="text-green-100">Average Score</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8" />
            <span className="text-2xl font-bold">{overallProgress.studyHours}</span>
          </div>
          <div className="text-purple-100">Hours This Week</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8" />
            <span className="text-2xl font-bold">{achievements.length}</span>
          </div>
          <div className="text-yellow-100">Achievements</div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="flex space-x-1 p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'analytics', label: 'Analytics', icon: ChartLine }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewType(id)}
              className={`flex-1 px-4 py-3 rounded-md flex items-center justify-center transition-colors ${
                viewType === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {viewType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Progress chart would be rendered here</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {weeklyStats.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">+{activity.points}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">Comprehension Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{performanceMetrics.comprehension}%</span>
                  {getTrendIcon(performanceMetrics.comprehensionTrend)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Speed Improvement</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{performanceMetrics.speed}%</span>
                  {getTrendIcon(performanceMetrics.speedTrend)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-700">Problem Solving</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{performanceMetrics.problemSolving}%</span>
                  {getTrendIcon(performanceMetrics.problemSolvingTrend)}
                </div>
              </div>
            </div>
          </div>

          {/* Study Consistency */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Consistency</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{day}</div>
                  <div className={`h-8 rounded ${
                    weeklyStats[index]?.studyTime > 0 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}></div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              You studied {weeklyStats.filter(d => d.studyTime > 0).length} out of 7 days this week
            </p>
          </div>
        </div>
      )}

      {viewType === 'subjects' && (
        <div className="space-y-6">
          {/* Subject Performance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectProgress.map((subject) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSubjectIcon(subject.name)}</span>
                    <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                  </div>
                  {getTrendIcon(subject.trend)}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Overall Progress</span>
                      <span className="font-medium">{subject.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Average Score</div>
                      <div className="font-bold text-lg">{subject.averageScore}%</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Time Spent</div>
                      <div className="font-bold text-lg">{subject.timeSpent}h</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Tests Taken</div>
                      <div className="font-medium">{subject.testsCompleted}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Rank</div>
                      <div className="font-medium">#{subject.rank}</div>
                    </div>
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="pt-3 border-t">
                    <div className="mb-2">
                      <span className="text-xs text-green-600 font-medium">Strengths:</span>
                      <p className="text-xs text-gray-600">{subject.strengths}</p>
                    </div>
                    <div>
                      <span className="text-xs text-red-600 font-medium">Focus Areas:</span>
                      <p className="text-xs text-gray-600">{subject.weaknesses}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {viewType === 'goals' && (
        <div className="space-y-6">
          {/* Add Goal Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Study Goals</h2>
            <button
              onClick={() => setShowAddGoal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Target className="w-4 h-4 mr-2" />
              Add Goal
            </button>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    goal.status === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : goal.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{goal.progress}% of {goal.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                  <span className="text-blue-600 font-medium">{goal.subject}</span>
                </div>

                {goal.status !== 'completed' && (
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                      className="flex-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Update Progress
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add Goal Modal */}
          {showAddGoal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Improve Math Score"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your goal..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Value
                      </label>
                      <input
                        type="number"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="85"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Goal Type
                      </label>
                      <select
                        value={newGoal.type}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="score">Score (%)</option>
                        <option value="time">Study Time (hours)</option>
                        <option value="books">Books Read</option>
                        <option value="tests">Tests Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <select
                        value={newGoal.subject}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select subject</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddGoal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createGoal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md her:bg-blue-700"
                  >
                    Create Goal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewType === 'analytics' && (
        <div className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Patterns */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="tex-lg font-semibold text-gray-900 mb-4">Study Patterns</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Study pattern chart would be rendered here</p>
                </div>
              </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-white rnded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Performance trend chart would be rendered here</p>
                </div>
              </div>
            </div>

      {/* Time Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Distribution</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Time distribution chart would be rendered here</p>
             </div>
              </div>
            </div>

            {/* Learning Insights */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Lightbulb className="w-5 h-5 text-blue-600-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Peak Performance Time</h4>
                      <p className="text-sm text-blue-700">
                        You perform best between 10 AM - 12 PM. Consider scheduling difficult subjects during this time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                 <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Strength Subject</h4>
                      <p className="text-sm text-green-700">
                        Mathematics is your strongest subject with 92% average score. Keep up the excellent work!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Improvement Area</h4>
                      <p className="text-sm text-yellow-700">
                        Consider spending more time on Chemistry. Your recent scores show room for impront.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900">Study Streak</h4>
                      <p className="text-sm text-purple-700">
                        You're on a {studyStreak}-day study streak! Consistency is key to academic success.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analytics</h3>
            
            <div className="grid grid-cols-1grid-cols-3 gap-6">
              {/* Study Efficiency */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {performanceMetrics.efficiency}%
                </div>
                <div className="text-sm text-gray-600 mb-1">Study Efficiency</div>
                <div className="text-xs text-gray-500">
                  Time spent vs. knowledge gained ratio
                </div>
              </div>

              {/* Retenon Rate */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {performanceMetrics.retention}%
                </div>
                <div className="text-sm text-gray-600 mb-1">Retention Rate</div>
                <div className="text-xs text-gray-500">
                  Knowledge retained after 7 days
                </div>
              </div>

              {/* Learning Velocity */}
              <div className="text-cener">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {performanceMetrics.velocity}x
                </div>
                <div className="text-sm text-gray-600 mb-1">Learning Velocity</div>
                <div className="text-xs text-gray-500">
                  Concepts learned per study hour
                </div>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="mt-8">
              <h4 className="font-mdium text-gray-900 mb-4">Weekly Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Subject</th>
                      <th className="text-center py-2">Hours</th>
                      <th className="text-center py-2">Tests</th>
                      <th className="text-center py-2">Avg Score</th>
                      <th className="text-center py-2">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectProgress.map((subject) => (
                      <tr key={subject.name} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <span>{getSubjectIcon(subject.name)}</span>
                            <span>{subject}</span>
                          </div>
                        </td>
                        <td className="text-center py-3">{subject.timeSpent}</td>
                        <td className="text-center py-3">{subject.testsCompleted}</td>
                        <td className="text-center py-3">{subject.averageScore}%</td>
                        <td className="text-center py-3">
                          <div className="flex items-center justify-center">
                            {getTrendIcon(subject.d)}
                            <span className={`ml-1 ${
                              subject.trend > 0 ? 'text-green-600' : 
                              subject.trend < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {subject.trend > 0 ? '+' : ''}{subject.trend}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
