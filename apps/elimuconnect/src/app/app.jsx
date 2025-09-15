import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import ErrorBoundary from '@components/common/ErrorBoundary';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Navigation from '@components/common/Navigation';
import ProtectedRoute from '@components/common/ProtectedRoute';
import { ROUTES } from '@utils/constants';

// Lazy load components for better performance
const Login = lazy(() => import('@components/auth/Login'));
const Register = lazy(() => import('@components/auth/Register'));
const ForgotPassword = lazy(() => import('@components/auth/ForgotPassword'));
const VerifyAccount = lazy(() => import('@components/auth/VerifyAccount'));

const StudentDashboard = lazy(() => import('@components/dashboard/StudentDashboard'));
const TeacherDashboard = lazy(() => import('@components/dashboard/TeacherDashboard'));
const AdminDashboard = lazy(() => import('@components/dashboard/AdminDashboard'));

const Library = lazy(() => import('@components/library/Library'));
const BookReader = lazy(() => import('@components/library/BookReader'));
const PastPapers = lazy(() => import('@components/papers/PastPapers'));
const Forums = lazy(() => import('@components/forums/Forums'));
const Messages = lazy(() => import('@components/messages/Messages'));
const Profile = lazy(() => import('@components/profile/Profile'));
const Settings = lazy(() => import('@components/settings/Settings'));

// Landing page
const LandingPage = lazy(() => import('@components/common/LandingPage'));

// 404 page
const NotFound = lazy(() => import('@components/common/NotFound'));

function App() {
  const { user, isLoading: authLoading, checkAuthStatus } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Check authentication status on app load
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.className = theme;
  }, [theme]);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Get dashboard component based on user role
  const getDashboardComponent = () => {
    if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
    
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <HelmetProvider>
      <ErrorBoundary showErrorDetails={import.meta.env.DEV}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Navigation - only show when user is authenticated */}
          {user && <Navigation />}
          
          {/* Main content */}
          <main className={user ? 'pt-16' : ''}>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
              </div>
            }>
              <Routes>
                {/* Public routes */}
                <Route 
                  path={ROUTES.HOME} 
                  element={user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <LandingPage />} 
                />
                <Route 
                  path={ROUTES.LOGIN} 
                  element={user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Login />} 
                />
                <Route 
                  path={ROUTES.REGISTER} 
                  element={user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Register />} 
                />
                <Route 
                  path="/forgot-password" 
                  element={user ? <Navigate to={ROUTES.DASHBOARD} replace /> : <ForgotPassword />} 
                />
                <Route 
                  path="/verify-account" 
                  element={<VerifyAccount />} 
                />

                {/* Protected routes */}
                <Route
                  path={ROUTES.DASHBOARD}
                  element={
                    <ProtectedRoute>
                      {getDashboardComponent()}
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path={ROUTES.LIBRARY}
                  element={
                    <ProtectedRoute>
                      <Library />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/library/book/:bookId"
                  element={
                    <ProtectedRoute>
                      <BookReader />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path={ROUTES.PAPERS}
                  element={
                    <ProtectedRoute>
                      <PastPapers />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path={ROUTES.FORUMS}
                  element={
                    <ProtectedRoute>
                      <Forums />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path={ROUTES.MESSAGES}
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path={ROUTES.PROFILE}
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path={ROUTES.SETTINGS}
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path={ROUTES.ADMIN}
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
              success: {
                className: 'bg-green-50 text-green-800 border border-green-200',
                iconTheme: {
                  primary: '#16a34a',
                  secondary: '#ffffff',
                },
              },
              error: {
                className: 'bg-red-50 text-red-800 border border-red-200',
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
