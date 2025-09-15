import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import AddressSelector from '../../components/AddressSelector.jsx';
import { renderWithProviders } from '../utils/test-utils.jsx';

const mockAddress = {
  id: 'address-1',
  userId: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  country: 'Test Country',
  phone: '555-1234',
  email: 'john@example.com',
  isDefault: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const initialState = {
  addresses: {
    addresses: [mockAddress],
    loading: false,
    error: null,
  },
  auth: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
    error: null,
  },
  categories: {
    categories: [],
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
  products: {
    products: [],
    currentProduct: null,
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

describe('AddressSelector', () => {
  const mockOnAddressSelect = jest.fn();
  const mockOnAddNew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders address selector with addresses', () => {
    renderWithProviders(
      <AddressSelector onAddressSelect={mockOnAddressSelect} onAddNew={mockOnAddNew} />,
      { preloadedState: initialState }
    );

    expect(screen.getByText(/123 test street/i)).toBeInTheDocument();
    expect(screen.getByText(/test city/i)).toBeInTheDocument();
    expect(screen.getByText(/test state/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  it('calls onAddNew when add new address button is clicked', () => {
    renderWithProviders(
      <AddressSelector onAddressSelect={mockOnAddressSelect} onAddNew={mockOnAddNew} />,
      { preloadedState: initialState }
    );

    fireEvent.click(screen.getByRole('button', { name: /add new address/i }));
    expect(mockOnAddNew).toHaveBeenCalledTimes(1);
  });

  it('calls onAddressSelect when address is clicked', () => {
    renderWithProviders(
      <AddressSelector onAddressSelect={mockOnAddressSelect} onAddNew={mockOnAddNew} />,
      { preloadedState: initialState }
    );

    fireEvent.click(screen.getByText(/123 test street/i));
    expect(mockOnAddressSelect).toHaveBeenCalledWith(mockAddress);
  });

  it('shows empty state when no addresses are available', () => {
    const emptyState = { ...initialState, addresses: { ...initialState.addresses, addresses: [] } };
    renderWithProviders(
      <AddressSelector onAddressSelect={mockOnAddressSelect} onAddNew={mockOnAddNew} />,
      { preloadedState: emptyState }
    );

    expect(screen.getByText(/no saved addresses/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first address/i)).toBeInTheDocument();
  });

  it('shows address count in header', () => {
    renderWithProviders(
      <AddressSelector onAddressSelect={mockOnAddressSelect} onAddNew={mockOnAddNew} />,
      { preloadedState: initialState }
    );

    expect(screen.getByText(/saved addresses \(1\)/i)).toBeInTheDocument();
  });

  it('highlights selected address', () => {
    renderWithProviders(
      <AddressSelector 
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
        selectedAddressId="address-1"
      />,
      { preloadedState: initialState }
    );

    // Find the card by looking for the element with the selected styling classes
    const selectedCard = document.querySelector('.ring-2.ring-blue-500.bg-blue-50');
    expect(selectedCard).toBeInTheDocument();
    expect(screen.getByText(/selected/i)).toBeInTheDocument();
  });

  it('shows default address indicator', () => {
    renderWithProviders(
      <AddressSelector onAddressSelect={mockOnAddressSelect} onAddNew={mockOnAddNew} />,
      { preloadedState: initialState }
    );

    expect(screen.getByText(/default/i)).toBeInTheDocument();
  });
});
