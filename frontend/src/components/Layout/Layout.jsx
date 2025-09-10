import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { toggleSidebar } from '../../store/slices/uiSlice.js';
import ModernHeader from './ModernHeader.jsx';
import Sidebar from './Sidebar.jsx';
import CartSidebar from './CartSidebar.jsx';

const Layout = () => {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <ModernHeader />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};

export default Layout;
