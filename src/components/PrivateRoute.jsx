import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  
  const accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  // For PrivateRoute, we primarily need a valid access token to grant initial access.
  // More robust user data validation can occur within the HomePage component.

  // If no access token is found, redirect to login
  // The responsibility for clearing tokens on logout or refresh failure is handled elsewhere (e.g., axiosInstance, logout function).
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 