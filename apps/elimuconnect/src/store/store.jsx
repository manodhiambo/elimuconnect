import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import librarySlice from './slices/librarySlice';
import forumSlice from './slices/forumSlice';
import messageSlice from './slices/messageSlice';
import progressSlice from './slices/progressSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    library: librarySlice,
    forum: forumSlice,
    messages: messageSlice,
    progress: progressSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// For TypeScript users, uncomment these lines:
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
