import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { libraryAPI } from '../../utils/api';

// Async thunks
export const fetchBooks = createAsyncThunk(
  'library/fetchBooks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await libraryAPI.getBooks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch books');
    }
  }
);

export const searchBooks = createAsyncThunk(
  'library/searchBooks',
  async ({ query, filters }, { rejectWithValue }) => {
    try {
      const response = await libraryAPI.searchBooks(query, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchBookmarks = createAsyncThunk(
  'library/fetchBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await libraryAPI.getBookmarks();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookmarks');
    }
  }
);

const initialState = {
  books: [],
  bookmarks: [],
  currentBook: null,
  searchQuery: '',
  filters: {
    subject: '',
    level: '',
    publisher: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  isLoading: false,
  isSearching: false,
  error: null,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },
    setCurrentBook: (state, action) => {
      state.currentBook = action.payload;
    },
    addBookmark: (state, action) => {
      if (!state.bookmarks.find(bookmark => bookmark._id === action.payload._id)) {
        state.bookmarks.push(action.payload);
      }
    },
    removeBookmark: (state, action) => {
      state.bookmarks = state.bookmarks.filter(
        bookmark => bookmark._id !== action.payload
      );
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch books
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = action.payload.books;
        state.pagination = {
          ...state.pagination,
          total: action.payload.total,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search books
      .addCase(searchBooks.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.isSearching = false;
        state.books = action.payload.books;
        state.pagination = {
          ...state.pagination,
          total: action.payload.total,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      })
      // Fetch bookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookmarks = action.payload.bookmarks;
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setFilters,
  resetFilters,
  setCurrentBook,
  addBookmark,
  removeBookmark,
  setPagination,
  clearError,
} = librarySlice.actions;

export default librarySlice.reducer;
