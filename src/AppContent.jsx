import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import ScanItemPage from './pages/ScanItemPage';
import PrivateRoute from './components/PrivateRoute';
import { setNavigator } from './services/navigationService';

const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/home" 
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <PrivateRoute>
            <InventoryPage />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/scan-item" 
        element={
          <PrivateRoute>
            <ScanItemPage />
          </PrivateRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppContent; 