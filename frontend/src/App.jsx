import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/Layout/Layout.jsx';
import LoadingSpinner from './components/UI/LoadingSpinner.jsx';
import { checkInitializationStatus } from './store/slices/authSlice.js';

// Public Pages
import HomePage from './pages/HomePage.jsx';
import ModernLoginPage from './pages/auth/ModernLoginPage.jsx';
import ModernRegisterPage from './pages/auth/ModernRegisterPage.jsx';
import SystemInitializationPage from './pages/SystemInitializationPage.jsx';
import StyleTestPage from './pages/StyleTestPage.jsx';

// Dashboard Pages
import CustomerDashboardPage from './pages/CustomerDashboardPage.jsx';
import ModernDashboardPage from './pages/ModernDashboardPage.jsx';

// Product Pages
import ModernProductsPage from './pages/products/ModernProductsPage.jsx';
import ProductDetailPage from './pages/products/ProductDetailPage.jsx';
import CategoriesPage from './pages/categories/CategoriesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RequestsPage from './pages/requests/RequestsPage.jsx';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminRequestsPage from './pages/admin/AdminRequestsPage.jsx';
import AdminStoreManagerRequestsPage from './pages/admin/AdminStoreManagerRequestsPage.jsx';

function AppRoutes() {
  const dispatch = useDispatch();
  const { user, loading } = useAuth();
  const { systemInitialized, initializationLoading } = useSelector(state => state.auth);

  useEffect(() => {
    // Check system initialization status on app load
    if (systemInitialized === null) {
      dispatch(checkInitializationStatus());
    }
  }, [dispatch, systemInitialized]);

  if (loading || initializationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If system is not initialized, show initialization page
  if (systemInitialized === false) {
    return (
      <Routes>
        <Route path="/initialize" element={<SystemInitializationPage />} />
        <Route path="*" element={<Navigate to="/initialize" replace />} />
      </Routes>
    );
  }

  // Helper function to get the appropriate dashboard component
  const getDashboardComponent = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'customer':
        return <CustomerDashboardPage />;
      case 'admin':
      case 'store_manager':
        return <ModernDashboardPage />;
      default:
        return <CustomerDashboardPage />;
    }
  };

  // Helper function to check if user has access to a route
  const hasAccess = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === 'any') return true;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/login" 
        element={!user ? <ModernLoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <ModernRegisterPage /> : <Navigate to="/dashboard" replace />} 
      />

      {/* System initialization route (redirect if already initialized) */}
      <Route 
        path="/initialize" 
        element={systemInitialized ? <Navigate to="/login" replace /> : <SystemInitializationPage />} 
      />

      {/* Style Test Route */}
      <Route path="/style-test" element={<StyleTestPage />} />

      {/* Protected Routes */}
      {user && (
        <Route path="/" element={<Layout />}>
          {/* Dashboard - Role-based */}
          <Route path="dashboard" element={getDashboardComponent()} />
          
          {/* Common Routes - All authenticated users */}
          <Route path="products" element={<ModernProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          
          {/* Customer-only routes */}
          {hasAccess('customer') && (
          <Route path="requests" element={<RequestsPage />} />
          )}

          {/* Admin-only Routes */}
          {hasAccess('admin') && (
            <>
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/products" element={<AdminProductsPage />} />
              <Route path="admin/categories" element={<AdminCategoriesPage />} />
              <Route path="admin/requests" element={<AdminRequestsPage />} />
              <Route path="admin/store-manager-requests" element={<AdminStoreManagerRequestsPage />} />
            </>
          )}

          {/* Store Manager Routes */}
          {hasAccess('store_manager') && (
            <>
              <Route path="manager/products" element={<AdminProductsPage />} />
              <Route path="manager/categories" element={<AdminCategoriesPage />} />
            </>
          )}
        </Route>
      )}

      {/* Fallback Routes */}
      <Route 
        path="*" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
