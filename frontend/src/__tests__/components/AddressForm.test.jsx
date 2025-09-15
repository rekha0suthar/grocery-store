import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import AddressForm from '../../components/AddressForm.jsx';
import { renderWithProviders } from '../utils/test-utils.jsx';
import { saveAddress, updateAddress } from '../../store/slices/addressSlice.js';

// Mock window.alert
global.alert = jest.fn();

// Mock Redux actions
jest.mock('../../store/slices/addressSlice.js', () => ({
  ...jest.requireActual('../../store/slices/addressSlice.js'),
  saveAddress: jest.fn(() => ({
    type: 'addresses/saveAddress/fulfilled',
    unwrap: () => Promise.resolve({ id: '1' })
  })),
  updateAddress: jest.fn(() => ({
    type: 'addresses/updateAddress/fulfilled',
    unwrap: () => Promise.resolve({ id: '1' })
  })),
}));

const initialState = {
  addresses: {
    addresses: [],
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
};

describe('AddressForm', () => {
  const defaultProps = {
    onSave: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert.mockClear();
  });

  it('renders address form with all fields', () => {
    renderWithProviders(<AddressForm {...defaultProps} />, { preloadedState: initialState });

    expect(screen.getByText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Email/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Address/i)[1]).toBeInTheDocument(); // Second occurrence (label, not title)
    expect(screen.getByText(/City/i)).toBeInTheDocument();
    expect(screen.getByText(/State/i)).toBeInTheDocument();
    expect(screen.getByText(/ZIP Code/i)).toBeInTheDocument();
  });

  it('shows save and cancel buttons', () => {
    renderWithProviders(<AddressForm {...defaultProps} />, { preloadedState: initialState });

    expect(screen.getByRole('button', { name: /save address/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderWithProviders(<AddressForm {...defaultProps} />, { preloadedState: initialState });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('submits form with valid data', async () => {
    renderWithProviders(<AddressForm {...defaultProps} />, { preloadedState: initialState });

    // Fill in all required fields using getAllByRole
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'John' } });
    fireEvent.change(textboxes[1], { target: { value: 'Doe' } });
    fireEvent.change(textboxes[2], { target: { value: 'john@example.com' } });
    fireEvent.change(textboxes[3], { target: { value: '555-1234' } });
    fireEvent.change(textboxes[4], { target: { value: '123 Main St' } });
    fireEvent.change(textboxes[5], { target: { value: 'New York' } });
    fireEvent.change(textboxes[6], { target: { value: 'NY' } });
    fireEvent.change(textboxes[7], { target: { value: '10001' } });

    const saveButton = screen.getByRole('button', { name: /save address/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveAddress).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      });
    });
  });

  it('pre-fills form when editing existing address', () => {
    const existingAddress = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210'
    };

    renderWithProviders(
      <AddressForm {...defaultProps} address={existingAddress} isEditing={true} />, 
      { preloadedState: initialState }
    );

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('555-1234')).toBeInTheDocument();
    expect(screen.getByDisplayValue('456 Oak Ave')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Los Angeles')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CA')).toBeInTheDocument();
    expect(screen.getByDisplayValue('90210')).toBeInTheDocument();
  });

  it('shows different button text and title when editing', () => {
    const existingAddress = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210'
    };

    renderWithProviders(
      <AddressForm {...defaultProps} address={existingAddress} isEditing={true} />, 
      { preloadedState: initialState }
    );

    expect(screen.getByRole('button', { name: /update address/i })).toBeInTheDocument();
    expect(screen.getByText('Edit Address')).toBeInTheDocument();
  });

  it('shows "Add New Address" title when not editing', () => {
    renderWithProviders(<AddressForm {...defaultProps} />, { preloadedState: initialState });

    expect(screen.getByText('Add New Address')).toBeInTheDocument();
  });

  it('handles form reset when cancel is clicked', () => {
    renderWithProviders(<AddressForm {...defaultProps} />, { preloadedState: initialState });

    // Fill in address field (5th textbox, index 4)
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[4], { 
      target: { value: '123 Main St' } 
    });

    // Verify field has value
    expect(textboxes[4].value).toBe('123 Main St');

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Verify onCancel was called
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when form is submitted successfully', async () => {
    renderWithProviders(<AddressForm {...defaultProps} />, { preloadedState: initialState });

    // Fill in required fields
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'John' } });
    fireEvent.change(textboxes[1], { target: { value: 'Doe' } });
    fireEvent.change(textboxes[2], { target: { value: 'john@example.com' } });
    fireEvent.change(textboxes[3], { target: { value: '555-1234' } });
    fireEvent.change(textboxes[4], { target: { value: '123 Main St' } });
    fireEvent.change(textboxes[5], { target: { value: 'New York' } });
    fireEvent.change(textboxes[6], { target: { value: 'NY' } });
    fireEvent.change(textboxes[7], { target: { value: '10001' } });

    const saveButton = screen.getByRole('button', { name: /save address/i });
    fireEvent.click(saveButton);

    // Verify onSave was called after successful submission
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });
  });
});
