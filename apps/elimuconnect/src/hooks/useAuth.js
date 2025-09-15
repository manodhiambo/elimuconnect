import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token and get user data
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('authToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser, requiresVerification } = response.data;
      
      if (requiresVerification) {
        return { 
          success: true, 
          requiresVerification: true, 
          message: 'Please check your email to verify your account' 
        };
      }
      
      // Auto-login after registration
      localStorage.setItem('authToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('Logout request failed:', error.message);
    } finally {
      // Clear local state regardless
      localStorage.removeItem('authToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  // Verify email function
  const verifyEmail = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/verify-email', { token });
      const { authToken, user: verifiedUser } = response.data;
      
      localStorage.setItem('authToken', authToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      setUser(verifiedUser);
      setIsAuthenticated(true);
      
      return { success: true, user: verifiedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (email) => {
    setError(null);
    
    try {
      await api.post('/auth/reset-password', { email });
      return { 
        success: true, 
        message: 'Password reset instructions sent to your email' 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Confirm password reset function
  const confirmPasswordReset = useCallback(async (token, newPassword) => {
    setError(null);
    
    try {
      await api.post('/auth/reset-password/confirm', { token, newPassword });
      return { 
        success: true, 
        message: 'Password reset successfully' 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset confirmation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update user profile
  const updateUser = useCallback(async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setError(null);
    
    try {
      await api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return { 
        success: true, 
        message: 'Password changed successfully' 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Refresh auth token
  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      
      localStorage.setItem('authToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      // Token refresh failed, logout user
      logout();
      return { success: false, error: 'Session expired' };
    }
  }, [logout]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has permission
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  // Get user's school information
  const getUserSchool = useCallback(() => {
    return user?.school || null;
  }, [user]);

  // Check if user is verified
  const isVerified = useCallback(() => {
    return user?.verified || false;
  }, [user]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    loading,
    isAuthenticated,
    error,
    
    // Actions
    login,
    register,
    logout,
    verifyEmail,
    resetPassword,
    confirmPasswordReset,
    updateUser,
    changePassword,
    refreshToken,
    clearError,
    
    // Utilities
    hasRole,
    hasPermission,
    getUserSchool,
    isVerified
  };
};

export default useAuth;
