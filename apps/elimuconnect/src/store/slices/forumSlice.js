import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { forumAPI } from '../../utils/api';

// Async thunks
export const fetchDiscussions = createAsyncThunk(
  'forum/fetchDiscussions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await forumAPI.getDiscussions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch discussions');
    }
  }
);

export const fetchDiscussion = createAsyncThunk(
  'forum/fetchDiscussion',
  async (id, { rejectWithValue }) => {
    try {
      const response = await forumAPI.getDiscussion(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch discussion');
    }
  }
);

export const createDiscussion = createAsyncThunk(
  'forum/createDiscussion',
  async (discussionData, { rejectWithValue }) => {
    try {
      const response = await forumAPI.createDiscussion(discussionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create discussion');
    }
  }
);

export const addReply = createAsyncThunk(
  'forum/addReply',
  async ({ discussionId, replyData }, { rejectWithValue }) => {
    try {
      const response = await forumAPI.addReply(discussionId, replyData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add reply');
    }
  }
);

export const voteDiscussion = createAsyncThunk(
  'forum/voteDiscussion',
  async ({ id, vote }, { rejectWithValue }) => {
    try {
      const response = await forumAPI.voteDiscussion(id, vote);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote');
    }
  }
);

const initialState = {
  discussions: [],
  currentDiscussion: null,
  categories: [],
  filters: {
    category: '',
    subject: '',
    sortBy: 'latest',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  isLoading: false,
  isCreating: false,
  error: null,
};

const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentDiscussion: (state, action) => {
      state.currentDiscussion = action.payload;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateDiscussionVote: (state, action) => {
      const { discussionId, vote, newScore } = action.payload;
      
      // Update in discussions list
      const discussionIndex = state.discussions.findIndex(d => d._id === discussionId);
      if (discussionIndex !== -1) {
        state.discussions[discussionIndex].votes = newScore;
        state.discussions[discussionIndex].userVote = vote;
      }
      
      // Update current discussion
      if (state.currentDiscussion && state.currentDiscussion._id === discussionId) {
        state.currentDiscussion.votes = newScore;
        state.currentDiscussion.userVote = vote;
      }
    },
    addReplyToDiscussion: (state, action) => {
      if (state.currentDiscussion) {
        state.currentDiscussion.replies.push(action.payload);
        state.currentDiscussion.replyCount += 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch discussions
      .addCase(fetchDiscussions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscussions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.discussions = action.payload.discussions;
        state.pagination = {
          ...state.pagination,
          total: action.payload.total,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(fetchDiscussions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch single discussion
      .addCase(fetchDiscussion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscussion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDiscussion = action.payload.discussion;
      })
      .addCase(fetchDiscussion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create discussion
      .addCase(createDiscussion.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDiscussion.fulfilled, (state, action) => {
        state.isCreating = false;
        state.discussions.unshift(action.payload.discussion);
      })
      .addCase(createDiscussion.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Add reply
      .addCase(addReply.fulfilled, (state, action) => {
        if (state.currentDiscussion) {
          state.currentDiscussion.replies.push(action.payload.reply);
          state.currentDiscussion.replyCount += 1;
        }
      })
      // Vote discussion
      .addCase(voteDiscussion.fulfilled, (state, action) => {
        const { discussionId, vote, newScore } = action.payload;
        
        // Update in discussions list
        const discussionIndex = state.discussions.findIndex(d => d._id === discussionId);
        if (discussionIndex !== -1) {
          state.discussions[discussionIndex].votes = newScore;
          state.discussions[discussionIndex].userVote = vote;
        }
        
        // Update current discussion
        if (state.currentDiscussion && state.currentDiscussion._id === discussionId) {
          state.currentDiscussion.votes = newScore;
          state.currentDiscussion.userVote = vote;
        }
      });
  },
});

export const {
  setFilters,
  resetFilters,
  setCurrentDiscussion,
  setPagination,
  updateDiscussionVote,
  addReplyToDiscussion,
  clearError,
} = forumSlice.actions;

export default forumSlice.reducer;
