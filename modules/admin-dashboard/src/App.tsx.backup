import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Auth Pages
import { LoginPage } from './features/auth/pages/LoginPage';

// Dashboard
import { DashboardPage } from './features/dashboard/pages/DashboardPage';

// User Management
import { UsersListPage } from './features/users/pages/UsersListPage';
import { UserDetailsPage } from './features/users/pages/UserDetailsPage';

// Content Management
import { ContentListPage } from './features/content/pages/ContentListPage';
import { ContentUploadPage } from './features/content/pages/ContentUploadPage';
import { ContentDetailsPage } from './features/content/pages/ContentDetailsPage';

// Schools
import { SchoolsListPage } from './features/schools/pages/SchoolsListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Users */}
                    <Route path="/users" element={<UsersListPage />} />
                    <Route path="/users/:id" element={<UserDetailsPage />} />
                    
                    {/* Content */}
                    <Route path="/content" element={<ContentListPage />} />
                    <Route path="/content/upload" element={<ContentUploadPage />} />
                    <Route path="/content/:id" element={<ContentDetailsPage />} />
                    
                    {/* Schools */}
                    <Route path="/schools" element={<SchoolsListPage />} />
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
