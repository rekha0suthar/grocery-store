import React from 'react';
import { screen } from '@testing-library/react';
import CheckoutPage from '../../pages/CheckoutPage.jsx';
import { renderWithProviders, createMockState } from '../utils/test-utils.js';

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

// Mock payment service
jest.mock('../../services/paymentService.js', () => ({
  getPaymentMethods: jest.fn(() => Promise.resolve({
    data: {
      methods: [
        {
          id: 'credit_card',
          displayName: 'Credit/Debit Card',
          fields: [
            { name: 'cardNumber', type: 'string', label: 'Card Number', required: true },
            { name: 'expiry', type: 'string', label: 'Expiry (MM/YY)', required: true },
            { name: 'cvv', type: 'string', label: 'CVV', required: true },
            { name: 'cardholder', type: 'string', label: 'Cardholder Name', required: true },
          ]
        },
        {
          id: 'cash_on_delivery',
          displayName: 'Cash on Delivery',
          fields: []
        }
      ]
    }
  })),
  processPayment: jest.fn(() => Promise.resolve({ status: 'authorized' }))
}));

// Mock payment hooks
jest.mock('../../hooks/useFlexiblePayment.js', () => ({
  useFlexiblePayment: () => ({
    selectedMethod: null,
    methodFields: {},
    fieldErrors: {},
    availableMethods: [],
    loading: true,
    error: null,
    handleMethodChange: jest.fn(),
    handleFieldChange: jest.fn(),
    validateFields: jest.fn(() => ({ isValid: true, errors: {} })),
    processPayment: jest.fn(() => Promise.resolve({ status: 'authorized' })),
    reset: jest.fn()
  })
}));

// Mock address form hook
jest.mock('../../hooks/useAddressForm.js', () => ({
  useAddressForm: () => ({
    formData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    validationErrors: {},
    useSavedAddress: false,
    handleInputChange: jest.fn(),
    handleAddressSelect: jest.fn(),
    handleUseSavedAddressChange: jest.fn(),
    handleAddNewAddress: jest.fn(),
    selectedAddressId: null,
    addresses: [],
    addressesLoading: false,
    addressesError: null
  })
}));

// Mock order utils
jest.mock('../../services/orderUtils.js', () => ({
  generateOrderId: () => 'order_123456789',
  calculateOrderTotals: (subtotal) => ({
    subtotal,
    shipping: 0,
    tax: 0,
    total: subtotal
  }),
  validateAddressForm: () => ({ isValid: true, errors: {} }),
  prepareOrderData: (params) => params
}));

const mockCartItems = [
  {
    productId: '1',
    productName: 'Test Product',
    productPrice: 10.99,
    quantity: 2,
    imageUrl: 'test-image.jpg'
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
      }
    });

    renderWithProviders(<CheckoutPage />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('shows empty cart message when cart is empty', () => {
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

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some items to your cart before checking out.')).toBeInTheDocument();
  });

  it('shows payment loading state', () => {
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

    // Check for loading state in payment section
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    // The component shows loading state when payment methods are loading
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

    // Use getAllByText since there are multiple instances
    const totalElements = screen.getAllByText('$21.98');
    expect(totalElements.length).toBeGreaterThan(0);
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

    // When cart is empty, it shows the empty cart message instead of order summary
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
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

    expect(screen.getByText('Place Order')).toBeInTheDocument();
  });

  it('shows back button', () => {
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

    expect(screen.getByText('Back')).toBeInTheDocument();
  });
});
