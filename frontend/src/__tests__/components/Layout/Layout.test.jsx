import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Layout from '../../../components/Layout/Layout.jsx';
import uiReducer from '../../../store/slices/uiSlice.js';

// Mock the auth context
const mockUseAuth = jest.fn();
jest.mock('../../../contexts/AuthContext.jsx', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the header and cart sidebar components
jest.mock('../../../components/Layout/ModernHeader.jsx', () => () => (
  <div data-testid="modern-header">Modern Header</div>
));

jest.mock('../../../components/Layout/CartSidebar.jsx', () => () => (
  <div data-testid="cart-sidebar">Cart Sidebar</div>
));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
}));

describe('Layout Component', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
      },
      preloadedState: {
        ui: {
          sidebarOpen: false,
        },
      },
    });
  });

  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders loading spinner when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    renderWithProviders(<Layout />);
    
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    renderWithProviders(<Layout />);
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });

  it('renders layout with header and outlet when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
    });

    renderWithProviders(<Layout />);
    
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  it('applies sidebar margin when sidebar is open', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
    });

    const storeWithSidebarOpen = configureStore({
      reducer: {
        ui: uiReducer,
      },
      preloadedState: {
        ui: {
          sidebarOpen: true,
        },
      },
    });

    render(
      <Provider store={storeWithSidebarOpen}>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </Provider>
    );
    
    const mainContent = screen.getByRole('main').parentElement;
    expect(mainContent).toHaveClass('lg:ml-64');
  });

  it('does not apply sidebar margin when sidebar is closed', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
    });

    renderWithProviders(<Layout />);
    
    const mainContent = screen.getByRole('main').parentElement;
    expect(mainContent).toHaveClass('ml-0');
  });
});
