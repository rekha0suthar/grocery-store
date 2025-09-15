import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCard from '../../../components/UI/ProductCard.jsx';
import { renderWithProviders, createMockState } from '../../utils/test-utils.jsx';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 10.99,
  images: ['test-image.jpg'],
  description: 'Test product description',
  stock: 10,
  category: 'Fruits'
};

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product card with product information', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(/\$10\.99/)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
  });

  it('renders product image', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    const image = screen.getByRole('img', { name: mockProduct.name });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockProduct.images[0]);
  });

  it('shows add to cart button', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('shows stock count', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/10 in stock/i)).toBeInTheDocument();
  });

  it('calls add to cart when button is clicked', async () => {
    const initialState = createMockState();
    const { store } = renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      const state = store.getState();
      expect(state.cart.items).toHaveLength(1);
    });
  });

  it('navigates to product detail when card is clicked', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    // Click on the card (not the button)
    const cardElement = screen.getByText(mockProduct.name).closest('div[class*="cursor-pointer"]');
    fireEvent.click(cardElement);

    expect(mockNavigate).toHaveBeenCalledWith(`/products/${mockProduct.id}`);
  });

  it('shows zero stock when product is out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={outOfStockProduct} />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/0 in stock/i)).toBeInTheDocument();
  });

  it('shows discount price when product has discount', () => {
    const discountedProduct = { ...mockProduct, discountPrice: 8.99 };
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={discountedProduct} />, {
      preloadedState: initialState
    });

    expect(screen.getByText(/\$8\.99/)).toBeInTheDocument();
    expect(screen.getByText(/\$8\.99/)).toHaveClass('line-through');
  });

  it('shows wishlist button', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    // The wishlist button should be present (heart icon)
    const wishlistButton = screen.getByRole('button', { name: '' }); // Heart button has no text
    expect(wishlistButton).toBeInTheDocument();
  });

  it('shows rating', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      preloadedState: initialState
    });

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('does not render when product is null', () => {
    const initialState = createMockState();
    const { container } = renderWithProviders(<ProductCard product={null} />, {
      preloadedState: initialState
    });

    expect(container.firstChild).toBeNull();
  });

  it('does not render when product has no id', () => {
    const productWithoutId = { ...mockProduct };
    delete productWithoutId.id;
    
    const initialState = createMockState();
    const { container } = renderWithProviders(<ProductCard product={productWithoutId} />, {
      preloadedState: initialState
    });

    expect(container.firstChild).toBeNull();
  });

  it('hides add to cart button when showAddToCart is false', () => {
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={mockProduct} showAddToCart={false} />, {
      preloadedState: initialState
    });

    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it('uses placeholder image when no images provided', () => {
    const productWithoutImage = { ...mockProduct, images: [] };
    const initialState = createMockState();
    renderWithProviders(<ProductCard product={productWithoutImage} />, {
      preloadedState: initialState
    });

    const image = screen.getByRole('img', { name: mockProduct.name });
    expect(image).toHaveAttribute('src', '/placeholder-product.jpg');
  });
});
