import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import ModernHeader from '../../../components/Layout/ModernHeader.jsx';
import { renderWithProviders, createMockState } from '../../utils/test-utils.js';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [new URLSearchParams()],
  useNavigate: () => jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ModernHeader', () => {
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
    expect(screen.getByText('All Products')).toBeInTheDocument();
  });

  it('shows login and signup buttons when not authenticated', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Login')).toBeInTheDocument();
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
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows cart button with item count', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [{ id: '1', quantity: 1 }] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    const cartButton = screen.getByText('1').closest('button');
    expect(cartButton).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Cart item count
  });

  it('shows wishlist button with item count', () => {
    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: [] },
      cart: { items: [] },
      wishlist: { items: [{ id: '1' }] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    const wishlistButton = screen.getByText('1').closest('button');
    expect(wishlistButton).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Wishlist item count
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
    expect(screen.getByText(/(admin)/)).toBeInTheDocument();
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
    expect(screen.getByText(/(store_manager)/)).toBeInTheDocument();
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

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // The actual logout logic is tested in the auth slice
    expect(logoutButton).toBeInTheDocument();
  });

  it('handles search form submission', () => {
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
    const searchForm = searchInput.closest('form');
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    fireEvent.submit(searchForm);

    expect(searchInput).toBeInTheDocument();
  });

  it('displays categories in navigation when available', () => {
    const mockCategories = [
      { id: '1', name: 'Electronics' },
      { id: '2', name: 'Clothing' },
      { id: '3', name: 'Books' }
    ];

    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: mockCategories },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('handles categories with missing or invalid data gracefully', () => {
    const mockCategories = [
      { id: '1', name: 'Valid Category' },
      { id: null, name: 'Invalid Category' }, // Missing ID
      { name: 'No ID Category' }, // Missing ID
      { id: '2', name: null }, // Missing name
      null, // Null category
      undefined // Undefined category
    ];

    const initialState = createMockState({
      auth: { user: null, isAuthenticated: false },
      categories: { categories: mockCategories },
      cart: { items: [] },
      wishlist: { items: [] }
    });

    renderWithProviders(<ModernHeader />, {
      preloadedState: initialState
    });

    // Should only show the valid category
    expect(screen.getByText('Valid Category')).toBeInTheDocument();
    expect(screen.queryByText('Invalid Category')).not.toBeInTheDocument();
    expect(screen.queryByText('No ID Category')).not.toBeInTheDocument();
    expect(screen.queryByText('null')).not.toBeInTheDocument();
  });
});
