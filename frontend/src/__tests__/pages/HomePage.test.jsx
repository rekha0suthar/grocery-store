import React from 'react';
import { screen } from '@testing-library/react';
import HomePage from '../../pages/HomePage.jsx';
import { renderWithProviders, createMockState } from '../utils/test-utils.jsx';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero section with main heading', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Fresh Groceries/i)).toBeInTheDocument();
    expect(screen.getByText(/Delivered to Your Door/i)).toBeInTheDocument();
  });

  it('shows hero section description', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Shop the freshest produce, organic foods/i)).toBeInTheDocument();
  });

  it('shows shop now and get started buttons', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByRole('button', { name: /shop now/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('shows features section headings', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    // Use getAllByText to handle multiple occurrences and check that at least one exists
    expect(screen.getAllByText(/Free Delivery/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Fresh Guarantee/i)).toBeInTheDocument();
    expect(screen.getByText(/24\/7 Support/i)).toBeInTheDocument();
  });

  it('shows features descriptions', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Fast and reliable service/i)).toBeInTheDocument();
    expect(screen.getByText(/100% fresh products or your money back/i)).toBeInTheDocument();
    expect(screen.getByText(/Round-the-clock customer support/i)).toBeInTheDocument();
  });

  it('shows categories section', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Shop by Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Find everything you need in our organized categories/i)).toBeInTheDocument();
  });

  it('shows featured products section', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Featured Products/i)).toBeInTheDocument();
    expect(screen.getByText(/Handpicked fresh products just for you/i)).toBeInTheDocument();
  });

  it('shows view all button in featured products section', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
  });

  it('shows newsletter signup section', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Stay Updated/i)).toBeInTheDocument();
    expect(screen.getByText(/Get the latest deals and fresh product updates/i)).toBeInTheDocument();
  });

  it('shows newsletter email input and subscribe button', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
  });

  it('shows loading spinner when products are loading', () => {
    const initialState = createMockState({
      products: {
        products: [],
        loading: true,
        error: null
      }
    });
    
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    // Check for loading spinner by role
    const loadingSpinners = screen.getAllByRole('status', { name: /loading/i });
    expect(loadingSpinners.length).toBeGreaterThan(0);
  });

  it('shows loading spinner when categories are loading', () => {
    const initialState = createMockState({
      categories: {
        categories: [],
        loading: true,
        error: null
      }
    });
    
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    // Check for loading spinner by role
    const loadingSpinners = screen.getAllByRole('status', { name: /loading/i });
    expect(loadingSpinners.length).toBeGreaterThan(0);
  });

  it('navigates to products page when shop now is clicked', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    const shopNowButton = screen.getByRole('button', { name: /shop now/i });
    expect(shopNowButton.closest('a')).toHaveAttribute('href', '/products');
  });

  it('navigates to register page when get started is clicked', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    expect(getStartedButton.closest('a')).toHaveAttribute('href', '/register');
  });

  it('navigates to products page when view all is clicked', () => {
    const initialState = createMockState();
    renderWithProviders(<HomePage />, {
      preloadedState: initialState
    });

    const viewAllButton = screen.getByRole('button', { name: /view all/i });
    expect(viewAllButton.closest('a')).toHaveAttribute('href', '/products');
  });
});
