// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminUser');

  if (!isAuthenticated) {
    // If not authenticated, redirect to admin login
    return <Navigate to="/admin" />;
  }

  // If authenticated, render the children components (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;
