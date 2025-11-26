import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  
  // Si está autenticado, muestra la página solicitada (Admin, Scanner, etc.)
  // Si NO está autenticado, redirige a la página de login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
