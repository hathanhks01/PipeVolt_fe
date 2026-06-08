import React from 'react';
import { Navigate } from 'react-router-dom';
import JwtUtils from '../constants/JwtUtils';

const ADMIN_ROLE = 0;
const EMPLOYEE_ROLE = 1;

const ProtectedRoute = ({ children, allowedRoles = [ADMIN_ROLE, EMPLOYEE_ROLE] }) => {
  const userType = JwtUtils.getCurrentUserType();
  const token = JwtUtils.getToken();

  // Check if user is logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (!allowedRoles.includes(parseInt(userType))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
