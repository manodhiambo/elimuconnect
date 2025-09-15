import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api'; // Changed from 'api' to 'authAPI'
import { STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  isLoading: true, // Changed to true initially to check auth status
  isAuthenticated: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Authentication check failed' });
      // Clear invalid data
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.profile?.firstName || user.firstName}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.register(userData);
      
      toast.success('Registration successful! Please verify your account.');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyAccount = async (verificationData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authAPI.verifyAccount(verificationData);
      const { user, token } = response.data;

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });

      toast.success('Account verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = { ...state.user, ...response.data.user };
      
      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      dispatch({ type: 'UPDATE_USER', payload: response.data.user });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword(email);
      toast.success('Password reset link sent to your email');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await authAPI.resetPassword(resetData.token, resetData.password);
      toast.success('Password reset successfully');
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Add updateUser method for Settings component
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    // State
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    
    // Methods
    login,
    register,
    verifyAccount,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
