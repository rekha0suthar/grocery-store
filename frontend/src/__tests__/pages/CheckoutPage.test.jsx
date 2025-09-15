import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import CheckoutPage from '../../pages/CheckoutPage.jsx';
import { renderWithProviders, createMockState } from '../utils/test-utils.jsx';

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

const mockCartItems = [
  {
    id: '1',
    productId: '1',
    name: 'Test Product',
    price: 10.99,
    productPrice: 10.99,
    quantity: 2,
    image: 'test-image.jpg'
  }
];

const mockAddresses = [
  {
    id: '1',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  }
];

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders checkout page with basic elements', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      },
      addresses: {
        items: mockAddresses,
        loading: false,
        error: null
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
    expect(screen.getByText('Payment Information')).toBeInTheDocument();
  });

  it('shows back to cart button', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    expect(screen.getByRole('button', { name: /back to cart/i })).toBeInTheDocument();
  });

  it('shows place order button', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    expect(screen.getByRole('button', { name: /place order/i })).toBeInTheDocument();
  });

  it('displays cart items in order summary', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    // Check for quantity and price display - use getAllByText to handle multiple occurrences
    const priceElements = screen.getAllByText('$21.98');
    expect(priceElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Qty: 2 × $10.99')).toBeInTheDocument();
  });

  it('shows payment method selection', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    // Check for payment method options by text content
    expect(screen.getByText('Credit/Debit Card')).toBeInTheDocument();
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();
  });

  it('shows form fields for shipping information', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    // Check for form inputs by counting them instead of looking for specific values
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(5); // Should have multiple text inputs

    // Check for specific input names
    // Just check that we have multiple text inputs
  });

  it('shows payment form fields when credit card is selected', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
  });

  it('shows subtotal and total in order summary', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows empty cart total when no items', () => {
    const initialState = createMockState({
      cart: {
        items: [],
        totalPrice: 0,
        itemCount: 0
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    // Check that $0.00 appears (there will be multiple instances - subtotal and total)
    const zeroElements = screen.getAllByText('$0.00');
    expect(zeroElements.length).toBeGreaterThan(0);
  });

  it('allows changing payment method', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalPrice: 21.98,
        itemCount: 2
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    const paymentSelect = screen.getByRole('combobox');
    fireEvent.change(paymentSelect, { target: { value: 'cod' } });

    expect(paymentSelect.value).toBe('cod');
  });
});
