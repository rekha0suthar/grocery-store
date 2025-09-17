import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './hooks/redux.js';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/Layout/Layout.jsx';
import LoadingSpinner from './components/UI/LoadingSpinner.jsx';
import { checkInitializationStatus } from './store/slices/authSlice.js';

import HomePage from './pages/HomePage.jsx';
import ModernLoginPage from './pages/auth/ModernLoginPage.jsx';
import ModernRegisterPage from './pages/auth/ModernRegisterPage.jsx';
import SystemInitializationPage from './pages/SystemInitializationPage.jsx';
import StyleTestPage from './pages/StyleTestPage.jsx';

import CustomerDashboardPage from './pages/CustomerDashboardPage.jsx';
import ModernDashboardPage from './pages/ModernDashboardPage.jsx';

import ModernProductsPage from './pages/products/ModernProductsPage.jsx';
import ProductDetailPage from './pages/products/ProductDetailPage.jsx';
import CategoriesPage from './pages/categories/CategoriesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import RequestsPage from './pages/requests/RequestsPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';

import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage.jsx';
import AdminRequestsPage from './pages/admin/AdminRequestsPage.jsx';

function AppRoutes() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAuth();
  const { systemInitialized, initializationLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (systemInitialized === null && !initializationLoading) {
      dispatch(checkInitializationStatus());
    }
  }, [dispatch, systemInitialized, initializationLoading]);

  if (loading || initializationLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (systemInitialized === false) {
    return (
      <Routes>
        <Route path="/initialize" element={<SystemInitializationPage />} />
        <Route path="*" element={<Navigate to="/initialize" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={!user ? <ModernLoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <ModernRegisterPage /> : <Navigate to="/dashboard" replace />}
      />
  
      <Route
        path="/initialize"
        element={systemInitialized ? <Navigate to="/login" replace /> : <SystemInitializationPage />}
      />
  
      <Route path="/style-test" element={<StyleTestPage />} />
  
      {user && (
        <Route path="/" element={<Layout />}>
          <Route path="products" element={<ModernProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
  
          {user.role === 'customer' && (
            <>
              <Route path="dashboard" element={<CustomerDashboardPage />} />
              <Route path="requests" element={<RequestsPage />} />
            </>
          )}
  
          {user.role === 'admin' && (
            <>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/products" element={<AdminProductsPage />} />
              <Route path="admin/categories" element={<AdminCategoriesPage />} />
              <Route path="admin/requests" element={<AdminRequestsPage />} />
            </>
          )}
  
          {user.role === 'store_manager' && (
            <>
              <Route path="dashboard" element={<ModernDashboardPage />} />
              <Route path="manager/dashboard" element={<ModernDashboardPage />} />
              <Route path="manager/products" element={<AdminProductsPage />} />
              <Route path="manager/categories" element={<AdminCategoriesPage />} />
            </>
          )}
        </Route>
      )}
  
      <Route
        path="*"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
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
