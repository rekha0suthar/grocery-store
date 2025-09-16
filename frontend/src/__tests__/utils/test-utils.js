// src/__tests__/utils/test-utils.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext.jsx';

// Import all slices
import authSlice from '../../store/slices/authSlice.js';
import cartSlice from '../../store/slices/cartSlice.js';
import productSlice from '../../store/slices/productSlice.js';
import categorySlice from '../../store/slices/categorySlice.js';
import orderSlice from '../../store/slices/orderSlice.js';
import addressSlice from '../../store/slices/addressSlice.js';
import uiSlice from '../../store/slices/uiSlice.js';
import paymentSlice from '../../store/slices/paymentSlice.js';
import requestSlice from '../../store/slices/requestSlice.js';
import wishlistSlice from '../../store/slices/wishlistSlice.js';

// Mock data
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  isActive: true,
};

export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  isActive: true,
};

export const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  price: 10.99,
  description: 'A test product',
  category: 'test-category',
  stock: 100,
  images: ['https://example.com/image.jpg'],
  isActive: true,
};

export const mockCategory = {
  id: 'category-1',
  name: 'Test Category',
  description: 'A test category',
  isActive: true,
};

export const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  items: [
    {
      productId: 'product-1',
      quantity: 2,
      price: 10.99,
    },
  ],
  total: 21.98,
  status: 'pending',
  shippingAddress: {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
  },
  createdAt: new Date().toISOString(),
};

export const mockAddress = {
  id: 'address-1',
  userId: 'user-1',
  street: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zipCode: '12345',
  isDefault: true,
};

// Create mock store
export const createMockStore = (preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      auth: authSlice,
      cart: cartSlice,
      products: productSlice,
      categories: categorySlice,
      orders: orderSlice,
      addresses: addressSlice,
      ui: uiSlice,
      payments: paymentSlice,
      requests: requestSlice,
      wishlist: wishlistSlice,
    },
    preloadedState,
  });
  return store;
};

// Create mock state
export const createMockState = (overrides = {}) => ({
  auth: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  cart: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  products: {
    items: [],
    loading: false,
    error: null,
    filters: {
      category: '',
      search: '',
      sortBy: 'name',
      sortOrder: 'asc',
    },
  },
  categories: {
    items: [],
    loading: false,
    error: null,
  },
  orders: {
    items: [],
    loading: false,
    error: null,
  },
  addresses: {
    items: [],
    loading: false,
    error: null,
  },
  ui: {
    sidebarOpen: false,
    theme: 'light',
    loading: false,
  },
  payments: {
    methods: [],
    loading: false,
    error: null,
  },
  requests: {
    items: [],
    loading: false,
    error: null,
  },
  wishlist: {
    items: [],
    loading: false,
    error: null,
  },
  ...overrides,
});

// Render with providers
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Test utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const createMockApiResponse = (data, success = true) => ({
  data,
  success,
  message: success ? 'Success' : 'Error',
});

export const createMockError = (message = 'Test error') => ({
  message,
  status: 400,
  data: null,
});

// Simple test to prevent Jest from complaining about empty test file
describe('test-utils', () => {
  it('should export test utilities', () => {
    expect(mockUser).toBeDefined();
    expect(mockAdmin).toBeDefined();
    expect(createMockState).toBeDefined();
    expect(renderWithProviders).toBeDefined();
  });
});
