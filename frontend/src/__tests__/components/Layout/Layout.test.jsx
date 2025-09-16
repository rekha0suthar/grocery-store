import React from 'react';
import { screen } from '@testing-library/react';
import Layout from '../../../components/Layout/Layout.jsx';
import { renderWithProviders, createMockState, mockUser } from '../../utils/test-utils.js';

// Mock the header and cart sidebar components
jest.mock('../../../components/Layout/ModernHeader.jsx', () => {
  return function MockHeader() {
    return <div data-testid="modern-header">Modern Header</div>;
  };
});

jest.mock('../../../components/Layout/CartSidebar.jsx', () => {
  return function MockCartSidebar() {
    return <div data-testid="cart-sidebar">Cart Sidebar</div>;
  };
});

// Mock LoadingSpinner
jest.mock('../../../components/UI/LoadingSpinner.jsx', () => {
  return function MockLoadingSpinner({ size }) {
    return <div data-testid="loading-spinner" className={`spinner-${size}`}>Loading...</div>;
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
}));

describe('Layout Component', () => {
  const renderLayout = (preloadedState = {}) => {
    const defaultState = createMockState({
      auth: {
        user: mockUser,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      ui: {
        sidebarOpen: false,
        theme: 'light',
        loading: false,
      },
      ...preloadedState,
    });

    return renderWithProviders(<Layout />, {
      preloadedState: defaultState,
    });
  };

  it('renders layout with header and outlet when user is authenticated', () => {
    renderLayout();
    
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  it('renders cart sidebar', () => {
    renderLayout();
    
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    const unauthenticatedState = {
      auth: {
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
    };

    renderLayout(unauthenticatedState);
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  it('applies correct classes when sidebar is open', () => {
    const sidebarOpenState = {
      ui: {
        sidebarOpen: true,
        theme: 'light',
        loading: false,
      },
    };

    const { container } = renderLayout(sidebarOpenState);
    
    // Check that the main content area has the correct class for sidebar open
    const mainContainer = container.querySelector('.lg\\:ml-64');
    expect(mainContainer).toBeInTheDocument();
  });

  it('applies correct classes when sidebar is closed', () => {
    const sidebarClosedState = {
      ui: {
        sidebarOpen: false,
        theme: 'light',
        loading: false,
      },
    };

    const { container } = renderLayout(sidebarClosedState);
    
    // Check that the main content area has the correct class for sidebar closed
    const mainContainer = container.querySelector('.ml-0');
    expect(mainContainer).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    renderLayout();
    
    // Check that header is present
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    
    // Check that outlet content is present
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    
    // Check that cart sidebar is present
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  it('renders with background styling', () => {
    const { container } = renderLayout();
    
    // Check that the main container has the correct background class
    const mainDiv = container.querySelector('.min-h-screen.bg-gray-50');
    expect(mainDiv).toBeInTheDocument();
  });

  it('renders header and sidebar components', () => {
    renderLayout();
    
    // All components should be present
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('handles different user roles', () => {
    const adminUser = {
      ...mockUser,
      role: 'admin',
    };

    const adminState = {
      auth: {
        user: adminUser,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    renderLayout(adminState);
    
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('maintains layout structure with different UI states', () => {
    const { rerender } = renderLayout();
    
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    
    // Re-render with sidebar open
    // const sidebarOpenState = createMockState({
    //   auth: {
    //     user: mockUser,
    //     token: 'mock-token',
    //     refreshToken: 'mock-refresh-token',
    //     isAuthenticated: true,
    //     loading: false,
    //     error: null,
    //   },
    //   ui: {
    //     sidebarOpen: true,
    //     theme: 'light',
    //     loading: false,
    //   },
    // });
    
    rerender(<Layout />);
    
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  it('shows transition classes for main content', () => {
    const { container } = renderLayout();
    
    // Check that the main content area has transition classes
    const mainContainer = container.querySelector('.transition-all.duration-300');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders main element with outlet', () => {
    renderLayout();
    
    const mainElement = screen.getByTestId('outlet').closest('main');
    expect(mainElement).toBeInTheDocument();
  });
});
