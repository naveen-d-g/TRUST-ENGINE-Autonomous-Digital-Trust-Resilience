import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading SOC Context...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // RBAC Check
  if (allowedRoles && user) {
    if (!allowedRoles.includes(user.role)) {
       // Viewer trying to access Admin page -> Redirect to Home or Unauthorized page
       // For now, redirect to home
       console.warn(`Access Denied: Role ${user.role} cannot access ${location.pathname}`);
       return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
