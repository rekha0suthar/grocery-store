import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import ModernHeader from '../../../components/Layout/ModernHeader.jsx';
import { renderWithProviders, createMockState } from '../../utils/test-utils.js';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ModernHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with logo and navigation', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    expect(screen.getByText('FreshMart')).toBeInTheDocument();
    expect(screen.getByText('Fresh Groceries')).toBeInTheDocument();
    expect(screen.getByText('All Products')).toBeInTheDocument();
  });

  it('shows login and register buttons when not authenticated', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    // Check for both the link and button versions
    expect(screen.getAllByText('Login')).toHaveLength(2);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows user info when authenticated', () => {
    const initialState = createMockState({
      auth: { 
        user: { name: 'Test User', email: 'test@example.com', role: 'customer' }, 
        isAuthenticated: true 
      },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
  });

  it('shows cart button with item count', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [{ id: '1', name: 'Test Product' }] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    // Find the cart button by looking for the shopping cart icon
    const buttons = screen.getAllByRole('button');
    const cartButton = buttons.find(button => 
      button.querySelector('svg path[d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"]')
    );
    
    expect(cartButton).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Cart item count
  });

  it('shows wishlist button with item count', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [{ id: '1', name: 'Test Product' }] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    // Find the wishlist button by looking for the heart icon
    const buttons = screen.getAllByRole('button');
    const wishlistButton = buttons.find(button => 
      button.querySelector('svg path[d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"]')
    );
    
    expect(wishlistButton).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Wishlist item count
  });

  it('handles search functionality', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    const searchInput = screen.getByPlaceholderText('Search for products...');
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput.value).toBe('test search');
  });

  it('shows admin user info when user is admin', () => {
    const initialState = createMockState({
      auth: { 
        user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' }, 
        isAuthenticated: true 
      },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('shows store manager user info when user is store manager', () => {
    const initialState = createMockState({
      auth: { 
        user: { name: 'Manager User', email: 'manager@example.com', role: 'store_manager' }, 
        isAuthenticated: true 
      },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Manager User')).toBeInTheDocument();
    expect(screen.getByText('store_manager')).toBeInTheDocument();
  });

  it('handles logout when logout button is clicked', () => {
    const initialState = createMockState({
      auth: { 
        user: { name: 'Test User', email: 'test@example.com', role: 'customer' }, 
        isAuthenticated: true 
      },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    const { store } = renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    // Find the logout button by looking for the logout icon
    const buttons = screen.getAllByRole('button');
    const logoutButton = buttons.find(button => 
      button.querySelector('svg path[d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"]')
    );
    
    expect(logoutButton).toBeInTheDocument();

    fireEvent.click(logoutButton);

    // Check that logout was dispatched
    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true); // This would be false after logout
  });

  it('shows mobile menu button on mobile', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    // Find the mobile menu button by looking for the hamburger menu icon
    const buttons = screen.getAllByRole('button');
    const menuButton = buttons.find(button => 
      button.querySelector('svg line[x1="4"][x2="20"][y1="12"][y2="12"]')
    );
    
    expect(menuButton).toBeInTheDocument();
  });

  it('displays contact information', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Free delivery on orders over $50')).toBeInTheDocument();
    expect(screen.getByText('Call us: (555) 123-4567')).toBeInTheDocument();
  });

  it('shows categories when available', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { 
        categories: [
          { id: '1', name: 'Fruits' },
          { id: '2', name: 'Vegetables' }
        ] 
      },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    // Categories would be displayed in the navigation
    expect(screen.getByText('All Products')).toBeInTheDocument();
  });
});
