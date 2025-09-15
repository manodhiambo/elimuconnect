import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI, analyticsAPI } from '../../utils/api';

// Async thunks
export const fetchUserProgress = createAsyncThunk(
  'progress/fetchUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProgress();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

export const fetchStudyAnalytics = createAsyncThunk(
  'progress/fetchStudyAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getStudyAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchPerformanceData = createAsyncThunk(
  'progress/fetchPerformanceData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getPerformanceData();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance data');
    }
  }
);

const initialState = {
  // User progress data
  totalPoints: 0,
  streakDays: 0,
  booksRead: 0,
  testsCompleted: 0,
  studyHours: 0,
  badges: [],
  achievements: [],
  weeklyGoalProgress: 0,
  
  // Analytics data
  studyTime: {
    daily: [],
    weekly: [],
    monthly: [],
  },
  performance: {
    subjects: [],
    trends: [],
    strengths: [],
    weaknesses: [],
  },
  goals: {
    daily: null,
    weekly: null,
    monthly: null,
  },
  
  // Activity tracking
  recentActivity: [],
  learningPath: [],
  recommendations: [],
  
  // Loading states
  isLoading: false,
  isUpdating: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    updatePoints: (state, action) => {
      state.totalPoints += action.payload;
    },
    updateStreak: (state, action) => {
      state.streakDays = action.payload;
    },
    incrementBooksRead: (state) => {
      state.booksRead += 1;
    },
    incrementTestsCompleted: (state) => {
      state.testsCompleted += 1;
    },
    addStudyTime: (state, action) => {
      state.studyHours += action.payload;
    },
    addBadge: (state, action) => {
      if (!state.badges.find(badge => badge.id === action.payload.id)) {
        state.badges.push(action.payload);
      }
    },
    addAchievement: (state, action) => {
      state.achievements.push({
        ...action.payload,
        earnedAt: new Date().toISOString(),
      });
    },
    updateWeeklyGoalProgress: (state, action) => {
      state.weeklyGoalProgress = action.payload;
    },
    addActivity: (state, action) => {
      state.recentActivity.unshift(action.payload);
      // Keep only last 20 activities
      if (state.recentActivity.length > 20) {
        state.recentActivity = state.recentActivity.slice(0, 20);
      }
    },
    setGoals: (state, action) => {
      state.goals = { ...state.goals, ...action.payload };
    },
    updateLearningPath: (state, action) => {
      state.learningPath = action.payload;
    },
    addRecommendation: (state, action) => {
      state.recommendations.push(action.payload);
    },
    removeRecommendation: (state, action) => {
      state.recommendations = state.recommendations.filter(
        rec => rec.id !== action.payload
      );
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProgress: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        const progress = action.payload.progress;
        state.totalPoints = progress.totalPoints || 0;
        state.streakDays = progress.streakDays || 0;
        state.booksRead = progress.booksRead || 0;
        state.testsCompleted = progress.testsCompleted || 0;
        state.studyHours = progress.studyHours || 0;
        state.badges = progress.badges || [];
        state.achievements = progress.achievements || [];
        state.weeklyGoalProgress = progress.weeklyGoalProgress || 0;
        state.recentActivity = progress.recentActivity || [];
        state.goals = progress.goals || state.goals;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch study analytics
      .addCase(fetchStudyAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStudyAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studyTime = action.payload.studyTime || state.studyTime;
        state.learningPath = action.payload.learningPath || [];
        state.recommendations = action.payload.recommendations || [];
      })
      .addCase(fetchStudyAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch performance data
      .addCase(fetchPerformanceData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPerformanceData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.performance = action.payload.performance || state.performance;
      })
      .addCase(fetchPerformanceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updatePoints,
  updateStreak,
  incrementBooksRead,
  incrementTestsCompleted,
  addStudyTime,
  addBadge,
  addAchievement,
  updateWeeklyGoalProgress,
  addActivity,
  setGoals,
  updateLearningPath,
  addRecommendation,
  removeRecommendation,
  clearError,
  resetProgress,
} = progressSlice.actions;

export default progressSlice.reducer;
