import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import ProductDetailPage from '../../../pages/products/ProductDetailPage.jsx';
import { renderWithProviders, mockProduct } from '../../utils/test-utils.js';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useAppDispatch to prevent any dispatching
const mockDispatch = jest.fn();
jest.mock('../../../hooks/redux.js', () => ({
  ...jest.requireActual('../../../hooks/redux.js'),
  useAppDispatch: () => mockDispatch,
}));

const testProduct = {
  ...mockProduct,
  id: '1',
  imageUrl: 'test-image.jpg',
  category: 'test-category',
  inStock: true,
  discount: 0,
};

const initialState = {
  products: {
    products: [],
    currentProduct: testProduct,
    searchResults: [],
    loading: false,
    error: null,
    pagination: {}
  },
  categories: {
    categories: [{ id: '1', name: 'Test Category' }],
    loading: false,
    error: null,
  },
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isOpen: false,
    loading: false,
    error: null,
  },
  wishlist: {
    items: [],
    loading: false,
    error: null,
  },
  auth: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  ui: {
    isSidebarOpen: false,
  },
  addresses: {
    addresses: [],
    loading: false,
    error: null,
  },
  orders: {
    orders: [],
    loading: false,
    error: null,
  },
  requests: {
    requests: [],
    loading: false,
    error: null,
  },
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  it('shows loading state when product is loading', () => {
    const loadingState = { ...initialState, products: { ...initialState.products, loading: true, currentProduct: null } };
    renderWithProviders(<ProductDetailPage />, { preloadedState: loadingState });
    
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('shows error message when product fails to load', () => {
    const errorState = { ...initialState, products: { ...initialState.products, error: 'Failed to load product', currentProduct: null } };
    renderWithProviders(<ProductDetailPage />, { preloadedState: errorState });
    
    expect(screen.getByText('Product not found')).toBeInTheDocument();
  });

  it('navigates back when back button is clicked in error state', () => {
    const errorState = { ...initialState, products: { ...initialState.products, currentProduct: null } };
    renderWithProviders(<ProductDetailPage />, { preloadedState: errorState });
    
    const backButton = screen.getByRole('button', { name: /back to products/i });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  it('renders product details when product is available', () => {
    renderWithProviders(<ProductDetailPage />, { preloadedState: initialState });
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('A test product')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
  });

  it('shows add to cart button when product is available', () => {
    renderWithProviders(<ProductDetailPage />, { preloadedState: initialState });
    
    expect(screen.getByRole('button', { name: /Add/i })).toBeInTheDocument();
  });
});
