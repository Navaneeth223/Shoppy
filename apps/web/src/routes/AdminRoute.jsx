import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';

export default function AdminRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['admin', 'superadmin'].includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
