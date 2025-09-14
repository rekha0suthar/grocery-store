import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import ModernHeader from './ModernHeader.jsx';
import CartSidebar from './CartSidebar.jsx';
import LoadingSpinner from '../UI/LoadingSpinner.jsx';

const Layout = () => {
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <main>
          <Outlet />
        </main>
      </div>
      
      <CartSidebar />
    </div>
  );
};

export default Layout;
