import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Handle both "ADMIN" and "ROLE_ADMIN" formats
  const normalizedRole = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;
  
  if (normalizedRole !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
