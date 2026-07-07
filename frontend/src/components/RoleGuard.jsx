import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLoader from './AppLoader';

const RoleGuard = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  if (!user.authenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user.role || (user.roles && user.roles[0]) || '').toUpperCase();
  const hasRole = allowedRoles.some(allowed => userRole.includes(allowed.toUpperCase()));

  if (!hasRole) {
    // Determine fallback redirect based on role or just unauthorized page
    // We could redirect to /unauthorized, but user specified redirecting to /login or unauthorized.
    // In the prompt: "If user logged in but role is not allowed: Redirect: /unauthorized"
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
