import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

// Import all the reducers
import authSlice from '../../store/slices/authSlice.js';
import productSlice from '../../store/slices/productSlice.js';
import categorySlice from '../../store/slices/categorySlice.js';
import cartSlice from '../../store/slices/cartSlice.js';
import requestSlice from '../../store/slices/requestSlice.js';
import orderSlice from '../../store/slices/orderSlice.js';
import uiSlice from '../../store/slices/uiSlice.js';
import wishlistSlice from '../../store/slices/wishlistSlice.js';
import addressSlice from '../../store/slices/addressSlice.js';

// Mock data
export const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'customer',
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

export const mockAdmin = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  isActive: true,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
};

export const mockAddress = {
  id: 'address-1',
  userId: 'user-1',
  street: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  country: 'Test Country',
  isDefault: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

export const mockOrder = {
  id: 'order-1',
  userId: 'user-1',
  items: [],
  totalAmount: 0,
  status: 'pending',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

export const mockProduct = {
  id: 'product-1',
  name: 'Test Product',
  description: 'A test product for testing',
  price: 10.99,
  stock: 100,
  categoryId: 'category-1',
  sku: 'TEST001',
  isActive: true,
  isFeatured: false,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

export const mockCategory = {
  id: 'category-1',
  name: 'Test Category',
  description: 'A test category',
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

export const mockCartItem = {
  id: 'cart-item-1',
  productId: 'product-1',
  name: 'Test Product',
  price: 10.99,
  quantity: 1,
  image: 'test-image.jpg'
};

export const mockWishlistItem = {
  id: 'wishlist-item-1',
  productId: 'product-1',
  name: 'Test Product',
  price: 10.99,
  image: 'test-image.jpg'
};

export const mockRequest = {
  id: 'request-1',
  userId: 'user-1',
  productName: 'Test Product Request',
  description: 'A test product request',
  status: 'pending',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

// Helper function to create a proper Redux store with all reducers
export const createStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      products: productSlice,
      categories: categorySlice,
      cart: cartSlice,
      requests: requestSlice,
      orders: orderSlice,
      ui: uiSlice,
      wishlist: wishlistSlice,
      addresses: addressSlice,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  });
};

// Helper function to create mock state with proper structure
export const createMockState = (overrides = {}) => {
  const defaultState = {
    auth: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      ...overrides.auth
    },
    products: {
      products: [],
      currentProduct: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      ...overrides.products
    },
    categories: {
      categories: [],
      categoryTree: [],
      currentCategory: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      loading: false,
      error: null,
      ...overrides.categories
    },
    cart: {
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isOpen: false,
      loading: false,
      error: null,
      ...overrides.cart
    },
    wishlist: {
      items: [],
      loading: false,
      error: null,
      ...overrides.wishlist
    },
    addresses: {
      items: [],
      currentAddress: null,
      loading: false,
      error: null,
      ...overrides.addresses
    },
    orders: {
      items: [],
      currentOrder: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      ...overrides.orders
    },
    requests: {
      items: [],
      currentRequest: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      ...overrides.requests
    },
    ui: {
      theme: 'light',
      sidebarOpen: false,
      notifications: [],
      ...overrides.ui
    }
  };

  return defaultState;
};

// Helper function to render components with Redux and Router providers
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Helper function to render components with just Redux provider (no router)
export const renderWithRedux = (
  ui,
  {
    preloadedState = {},
    store = createStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        {children}
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
