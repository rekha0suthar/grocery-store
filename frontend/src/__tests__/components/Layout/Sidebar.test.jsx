import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import Sidebar from '../../../components/Layout/Sidebar.jsx';
import { renderWithProviders } from '../../utils/test-utils.js';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  NavLink: ({ children, to, onClick, ...props }) => (
    <a href={to} onClick={onClick} {...props}>{children}</a>
  ),
}));

const initialState = {
  auth: {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'customer'
    },
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  products: {
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
  },
  categories: {
    categories: [],
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

describe('Sidebar', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders sidebar when open', () => {
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: initialState });
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithProviders(<Sidebar {...defaultProps} isOpen={false} />, { preloadedState: initialState });
    
    // When closed, the sidebar should have -translate-x-full class (hidden)
    const sidebar = screen.getByRole('navigation').closest('div');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('shows navigation links', () => {
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: initialState });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('My Requests')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: initialState });
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: initialState });
    
    // The overlay is the div with bg-black bg-opacity-50
    const overlay = screen.getByRole('navigation').parentElement.previousElementSibling;
    fireEvent.click(overlay);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows admin links when user is admin', () => {
    const adminState = {
      ...initialState,
      auth: { ...initialState.auth, user: { ...initialState.auth.user, role: 'admin' } }
    };
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: adminState });
    
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage Products')).toBeInTheDocument();
    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    expect(screen.getByText('Manage Requests')).toBeInTheDocument();
  });

  it('shows store manager links when user is store manager', () => {
    const managerState = {
      ...initialState,
      auth: { ...initialState.auth, user: { ...initialState.auth.user, role: 'store_manager' } }
    };
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: managerState });
    
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage Products')).toBeInTheDocument();
    expect(screen.getByText('Manage Requests')).toBeInTheDocument();
    // Store managers should not see Manage Categories
    expect(screen.queryByText('Manage Categories')).not.toBeInTheDocument();
  });

  it('does not show admin links for regular users', () => {
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: initialState });
    
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Manage Products')).not.toBeInTheDocument();
  });

  it('calls onClose when navigation link is clicked', () => {
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: initialState });
    
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders without user when user is null', () => {
    const noUserState = {
      ...initialState,
      auth: { ...initialState.auth, user: null, isAuthenticated: false }
    };
    renderWithProviders(<Sidebar {...defaultProps} />, { preloadedState: noUserState });
    
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    // Should not show admin links when no user
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });
});
