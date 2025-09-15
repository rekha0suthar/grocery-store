import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ModernLoginPage from '../../pages/auth/ModernLoginPage.jsx';
import authSlice from '../../store/slices/authSlice.js';

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useDispatch
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('ModernLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithProviders(<ModernLoginPage />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to continue shopping')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('handles form input changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ModernLoginPage />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows remember me checkbox', () => {
    renderWithProviders(<ModernLoginPage />);
    
    const rememberMeCheckbox = screen.getByLabelText('Remember me');
    expect(rememberMeCheckbox).toBeInTheDocument();
    expect(rememberMeCheckbox).toHaveAttribute('type', 'checkbox');
  });

  it('shows forgot password link', () => {
    renderWithProviders(<ModernLoginPage />);
    
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveAttribute('href', '#');
  });

  it('handles forgot password click', () => {
    renderWithProviders(<ModernLoginPage />);
    
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    fireEvent.click(forgotPasswordLink);
    
    // The link exists but doesn't have specific functionality yet
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('shows social login buttons', () => {
    renderWithProviders(<ModernLoginPage />);
    
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('shows register link', () => {
    renderWithProviders(<ModernLoginPage />);
    
    const registerLink = screen.getByText('Sign up for free');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('handles social login', () => {
    renderWithProviders(<ModernLoginPage />);
    
    const googleButton = screen.getByText('Google');
    fireEvent.click(googleButton);
    
    // Social login buttons exist but don't have specific functionality yet
    expect(googleButton).toBeInTheDocument();
  });

  it('redirects to dashboard when user is already authenticated', () => {
    const initialState = {
      auth: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        token: 'mock-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };
    
    renderWithProviders(<ModernLoginPage />, { initialState });
    
    // Should redirect to dashboard (this would be handled by the router)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
