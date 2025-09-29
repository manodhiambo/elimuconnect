import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { LibraryPage } from './features/library/pages/LibraryPage';
import { ContentUploadPage } from './features/library/pages/ContentUploadPage';
import { AssessmentsPage } from './features/assessment/pages/AssessmentsPage';
import { CommunicationPage } from './features/communication/pages/CommunicationPage';
import { AdminPanelPage } from './features/admin/pages/AdminPanelPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
            <Route path="communication" element={<CommunicationPage />} />
            
            {/* Admin only routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminPanelPage />
                </ProtectedRoute>
              }
            />
            
            {/* Teacher & Admin routes */}
            <Route
              path="content/upload"
              element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}>
                  <ContentUploadPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
