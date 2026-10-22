import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route protection specifically for Admin Portal (/admin/dashboard)
 * Checks if a token exists and the stored user role is 'admin'
 */
export const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch {
    user = null;
  }

  const isAdmin = token && user && (user.role === 'admin' || user.role === 'SUPER_ADMIN');

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
