import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import AddressSelector from '../../components/AddressSelector.jsx';
import { renderWithProviders } from '../utils/test-utils.js';

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

const mockAddresses = [mockAddress];

describe('AddressSelector', () => {
  const mockOnAddressSelect = jest.fn();
  const mockOnAddNew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders address selector with addresses', () => {
    renderWithProviders(
      <AddressSelector 
        addresses={mockAddresses}
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
      />
    );

    expect(screen.getByText(/123 test street/i)).toBeInTheDocument();
    expect(screen.getByText(/test city/i)).toBeInTheDocument();
    expect(screen.getByText(/test state/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  it('calls onAddNew when add new address button is clicked', () => {
    renderWithProviders(
      <AddressSelector 
        addresses={mockAddresses}
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /add new address/i }));
    expect(mockOnAddNew).toHaveBeenCalledTimes(1);
  });

  it('calls onAddressSelect when address is clicked', () => {
    renderWithProviders(
      <AddressSelector 
        addresses={mockAddresses}
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
      />
    );

    fireEvent.click(screen.getByText(/123 test street/i));
    expect(mockOnAddressSelect).toHaveBeenCalledWith(mockAddress);
  });

  it('shows empty state when no addresses are available', () => {
    renderWithProviders(
      <AddressSelector 
        addresses={[]}
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
      />
    );

    expect(screen.getByText(/no saved addresses/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first address/i)).toBeInTheDocument();
  });

  it('shows address count in header', () => {
    renderWithProviders(
      <AddressSelector 
        addresses={mockAddresses}
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
      />
    );

    expect(screen.getByText(/saved addresses \(1\)/i)).toBeInTheDocument();
  });

  it('highlights selected address', () => {
    renderWithProviders(
      <AddressSelector 
        addresses={mockAddresses}
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
        selectedAddressId="address-1"
      />
    );

    // Find the card by looking for the element with the selected styling classes
    const selectedCard = document.querySelector('.ring-2.ring-blue-500.bg-blue-50');
    expect(selectedCard).toBeInTheDocument();
    expect(screen.getByText(/selected/i)).toBeInTheDocument();
  });

  it('shows default address indicator', () => {
    renderWithProviders(
      <AddressSelector 
        addresses={mockAddresses}
        onAddressSelect={mockOnAddressSelect} 
        onAddNew={mockOnAddNew} 
      />
    );

    expect(screen.getByText(/default/i)).toBeInTheDocument();
  });
});
