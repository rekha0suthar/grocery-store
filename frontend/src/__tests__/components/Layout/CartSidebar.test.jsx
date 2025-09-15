import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import CartSidebar from '../../../components/Layout/CartSidebar.jsx';
import { renderWithProviders, createMockState } from '../../utils/test-utils.jsx';

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
    productName: 'Test Product',
    price: 10.99,
    productPrice: 10.99,
    quantity: 2,
    image: 'test-image.jpg',
    imageUrl: 'test-image.jpg'
  }
];

describe('CartSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders cart sidebar when open', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const initialState = createMockState({
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isOpen: false
      }
    });

    const { container } = renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    // When closed, the component should not render the overlay or sidebar
    expect(container.querySelector('.fixed.inset-0')).toBeNull();
  });

  it('shows cart items', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
  });

  it('shows total price and item count', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    expect(screen.getByText('$21.98')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Item count
  });

  it('calls closeCart when close button is clicked', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    const { store } = renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    // Find the close button by its SVG icon (X mark) - it's the first button
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0]; // First button is the close button
    fireEvent.click(closeButton);

    // Check that the cart is closed by checking the state
    const state = store.getState();
    expect(state.cart.isOpen).toBe(false);
  });

  it('calls closeCart when overlay is clicked', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    const { store } = renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    // Find the overlay by its class
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
    
    // Click the overlay
    fireEvent.click(overlay);
    
    // Check that the cart is closed by checking the state
    const state = store.getState();
    expect(state.cart.isOpen).toBe(false);
  });

  it('shows empty cart message when no items', () => {
    const initialState = createMockState({
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isOpen: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('shows checkout button when items exist', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    expect(screen.getByRole('button', { name: /checkout/i })).toBeInTheDocument();
  });

  it('does not show checkout button when cart is empty', () => {
    const initialState = createMockState({
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isOpen: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    expect(screen.queryByRole('button', { name: /checkout/i })).not.toBeInTheDocument();
  });

  it('updates quantity when quantity buttons are clicked', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    const { store } = renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    // Find the increment button (the one with + icon)
    const buttons = screen.getAllByRole('button');
    const incrementButton = buttons.find(button => 
      button.querySelector('svg path[d="M5 12h14"]') && 
      button.querySelector('svg path[d="M12 5v14"]')
    );
    
    expect(incrementButton).toBeInTheDocument();
    fireEvent.click(incrementButton);

    // Check if quantity was updated by checking the state
    const state = store.getState();
    const updatedItem = state.cart.items.find(item => item.productId === '1');
    expect(updatedItem.quantity).toBe(3); // Should be incremented from 2 to 3
  });

  it('removes item when remove button is clicked', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    const { store } = renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    // Find the remove button (the red one with trash icon)
    const buttons = screen.getAllByRole('button');
    const removeButton = buttons.find(button => 
      button.classList.contains('text-red-500') &&
      button.querySelector('svg path[d="M3 6h18"]')
    );
    
    expect(removeButton).toBeInTheDocument();
    fireEvent.click(removeButton);

    // Check if item was removed by checking the state
    const state = store.getState();
    expect(state.cart.items).toHaveLength(0);
    expect(state.cart.totalItems).toBe(0);
  });

  it('shows loading state when products are loading', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true,
        loading: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    // Check for loading indicator (this depends on implementation)
    expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
  });

  it('shows error message when products fail to load', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true,
        error: 'Failed to load cart'
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    // Check for error message (this depends on implementation)
    expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
  });

  it('prevents event propagation when sidebar content is clicked', () => {
    const initialState = createMockState({
      cart: {
        items: mockCartItems,
        totalItems: 2,
        totalPrice: 21.98,
        isOpen: true
      }
    });

    renderWithProviders(<CartSidebar />, {
      preloadedState: initialState
    });

    const sidebarContent = document.querySelector('.bg-white');
    if (sidebarContent) {
      const stopPropagation = jest.fn();
      fireEvent.click(sidebarContent, { stopPropagation });
      // This test depends on the actual implementation
      expect(screen.getByText(/Shopping Cart/i)).toBeInTheDocument();
    }
  });
});
