import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to={`/auth?mode=login&returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireAdmin && !user?.isAdmin) {
    // Redirect non-admin users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}