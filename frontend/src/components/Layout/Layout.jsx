import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
// import { toggleSidebar as _toggleSidebar } from '../../store/slices/uiSlice.js';
import ModernHeader from './ModernHeader.jsx';
// import _Sidebar from './Sidebar.jsx';
import CartSidebar from './CartSidebar.jsx';

const Layout = () => {
  // const _dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user, loading } = useAuth();

  // Show loading while authentication is being restored
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
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
