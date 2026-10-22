import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Route protection for Orphanage Dashboard (/orphanage/dashboard)
 * Checks if a token exists and user role is orphanage/orphanage_admin.
 */
export const OrphanageProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");

  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch {
    user = null;
  }

  const isOrphanage = token && user && (user.role === "orphanage" || user.role === "orphanage_admin");

  if (!isOrphanage) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default OrphanageProtectedRoute;
