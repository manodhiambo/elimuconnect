import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from '../../utils/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getConversations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'messages/fetchConversation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getConversation(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversation');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, messageData }, { rejectWithValue }) => {
    try {
      const response = await messageAPI.sendMessage(conversationId, messageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async (recipientId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.createConversation(recipientId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isSending: false,
  error: null,
  typingUsers: [],
  onlineUsers: [],
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
      state.messages = action.payload?.messages || [];
    },
    addMessage: (state, action) => {
      const message = action.payload;
      
      // Add to current conversation messages
      if (state.currentConversation && 
          state.currentConversation._id === message.conversationId) {
        state.messages.push(message);
      }
      
      // Update conversation in list
      const conversationIndex = state.conversations.findIndex(
        conv => conv._id === message.conversationId
      );
      
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = message;
        state.conversations[conversationIndex].updatedAt = message.createdAt;
        
        // Move conversation to top
        const conversation = state.conversations[conversationIndex];
        state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(conversation);
      }
    },
    markConversationAsRead: (state, action) => {
      const conversationId = action.payload;
      const conversation = state.conversations.find(conv => conv._id === conversationId);
      
      if (conversation) {
        conversation.unreadCount = 0;
        state.unreadCount = state.conversations.reduce(
          (total, conv) => total + (conv.unreadCount || 0), 0
        );
      }
    },
    updateTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
    updateOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addConversation: (state, action) => {
      const newConversation = action.payload;
      const existingIndex = state.conversations.findIndex(
        conv => conv._id === newConversation._id
      );
      
      if (existingIndex === -1) {
        state.conversations.unshift(newConversation);
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find(msg => msg._id === messageId);
      
      if (message) {
        message.status = status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
        state.unreadCount = action.payload.conversations.reduce(
          (total, conv) => total + (conv.unreadCount || 0), 0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch conversation
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload.conversation;
        state.messages = action.payload.conversation.messages || [];
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const message = action.payload.message;
        
        // Add to current conversation
        if (state.currentConversation && 
            state.currentConversation._id === message.conversationId) {
          state.messages.push(message);
        }
        
        // Update conversation in list
        const conversationIndex = state.conversations.findIndex(
          conv => conv._id === message.conversationId
        );
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = message;
          state.conversations[conversationIndex].updatedAt = message.createdAt;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const newConversation = action.payload.conversation;
        state.conversations.unshift(newConversation);
        state.currentConversation = newConversation;
        state.messages = [];
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  markConversationAsRead,
  updateTypingUsers,
  updateOnlineUsers,
  addConversation,
  updateMessageStatus,
  clearError,
} = messageSlice.actions;

export default messageSlice.reducer;
