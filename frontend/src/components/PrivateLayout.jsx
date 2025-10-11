import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar/Sidebar'; // Import the new Sidebar

const PrivateLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet /> {/* This will render Dashboard, History, or Profile page */}
      </div>
    </div>
  );
};

export default PrivateLayout;