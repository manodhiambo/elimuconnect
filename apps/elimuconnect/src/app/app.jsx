import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { store } from '../store/store';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Navigation from '../components/common/Navigation';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load components for better performance
const Login = React.lazy(() => import('../components/auth/Login'));
const Register = React.lazy(() => import('../components/auth/Register'));
const VerifyAccount = React.lazy(() => import('../components/auth/VerifyAccount'));
const ForgotPassword = React.lazy(() => import('../components/auth/ForgotPassword'));
const StudentDashboard = React.lazy(() => import('../components/dashboard/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('../components/dashboard/TeacherDashboard'));
const AdminDashboard = React.lazy(() => import('../components/dashboard/AdminDashboard'));
const DigitalLibrary = React.lazy(() => import('../components/library/BookSearch'));
const PastPapers = React.lazy(() => import('../components/papers/PastPapers'));
const DiscussionForum = React.lazy(() => import('../components/communication/DiscussionForum'));
const MessageCenter = React.lazy(() => import('../components/communication/MessageCenter'));
const UserProfile = React.lazy(() => import('../components/profile/UserProfile'));
const StudyGroups = React.lazy(() => import('../components/communication/StudyGroups'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <Navigation />
                  <main className="pt-16">
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify" element={<VerifyAccount />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        
                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <DashboardRouter />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/library" element={
                          <ProtectedRoute>
                            <DigitalLibrary />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/papers" element={
                          <ProtectedRoute>
                            <PastPapers />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/forum" element={
                          <ProtectedRoute>
                            <DiscussionForum />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/messages" element={
                          <ProtectedRoute>
                            <MessageCenter />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/groups" element={
                          <ProtectedRoute>
                            <StudyGroups />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/profile" element={
                          <ProtectedRoute>
                            <UserProfile />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </React.Suspense>
                  </main>
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      className: 'dark:bg-gray-800 dark:text-white',
                    }}
                  />
                </div>
              </Router>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

// Dashboard Router Component
function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default App;
