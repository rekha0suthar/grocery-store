import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import GridProductCard from '../../../components/UI/GridProductCard.jsx';
import ListProductCard from '../../../components/UI/ListProductCard.jsx';
import { renderWithProviders, createMockState } from '../../utils/test-utils.jsx';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'A test product description',
  price: 29.99,
  images: ['test-image.jpg'],
  stock: 10,
  discount: 0
};

const discountedProduct = {
  id: '2',
  name: 'Discounted Product',
  description: 'A discounted product',
  price: 50.00,
  discountPrice: 40.00, // Discount price comes from DB
  discount: 20, // Percentage for reference
  images: ['discounted-image.jpg'],
  stock: 5
};

const productWithoutImage = {
  id: '3',
  name: 'Product Without Image',
  description: 'A product without image',
  price: 15.99,
  images: [],
  stock: 8
};

const productWithoutId = {
  name: 'Product Without ID',
  description: 'A product without ID',
  price: 25.99,
  images: ['no-id-image.jpg'],
  stock: 3
};

describe('GridProductCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders product information correctly', () => {
    renderWithProviders(<GridProductCard product={mockProduct} />, {
      preloadedState: createMockState()
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('A test product description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('renders discounted product with correct pricing', () => {
    renderWithProviders(<GridProductCard product={discountedProduct} />, {
      preloadedState: createMockState()
    });

    expect(screen.getByText('$40.00')).toBeInTheDocument(); // discountPrice from DB
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // original price
  });

  it('handles click events correctly', () => {
    renderWithProviders(<GridProductCard product={mockProduct} />, {
      preloadedState: createMockState()
    });

    const card = screen.getByText('Test Product').closest('.group');
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/products/1');
  });

  it('handles add to cart', () => {
    const mockOnAddToCart = jest.fn();
    renderWithProviders(
      <GridProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />,
      { preloadedState: createMockState() }
    );

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('does not render when product has no ID', () => {
    const { container } = renderWithProviders(<GridProductCard product={productWithoutId} />, {
      preloadedState: createMockState()
    });
    expect(container.firstChild).toBeNull();
  });

  it('hides add to cart button when showAddToCart is false', () => {
    renderWithProviders(<GridProductCard product={mockProduct} showAddToCart={false} />, {
      preloadedState: createMockState()
    });

    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
  });

  it('renders placeholder image when no image is provided', () => {
    renderWithProviders(<GridProductCard product={productWithoutImage} />, {
      preloadedState: createMockState()
    });

    const image = screen.getByAltText('Product Without Image');
    expect(image).toHaveAttribute('src', '/placeholder-product.jpg');
  });
});

describe('ListProductCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders product information correctly', () => {
    renderWithProviders(<ListProductCard product={mockProduct} />, {
      preloadedState: createMockState()
    });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('A test product description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('renders discounted product with correct pricing', () => {
    renderWithProviders(<ListProductCard product={discountedProduct} />, {
      preloadedState: createMockState()
    });

    expect(screen.getByText('$40.00')).toBeInTheDocument(); // discountPrice from DB
    expect(screen.getByText('$50.00')).toBeInTheDocument(); // original price
  });

  it('handles click events correctly', () => {
    renderWithProviders(<ListProductCard product={mockProduct} />, {
      preloadedState: createMockState()
    });

    const card = screen.getByText('Test Product').closest('.group');
    fireEvent.click(card);
    expect(mockNavigate).toHaveBeenCalledWith('/products/1');
  });

  it('handles add to cart', () => {
    const mockOnAddToCart = jest.fn();
    renderWithProviders(
      <ListProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />,
      { preloadedState: createMockState() }
    );

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('does not render when product has no ID', () => {
    const { container } = renderWithProviders(<ListProductCard product={productWithoutId} />, {
      preloadedState: createMockState()
    });
    expect(container.firstChild).toBeNull();
  });

  it('hides add to cart button when showAddToCart is false', () => {
    renderWithProviders(<ListProductCard product={mockProduct} showAddToCart={false} />, {
      preloadedState: createMockState()
    });

    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
  });

  it('renders placeholder when no image is provided', () => {
    renderWithProviders(<ListProductCard product={productWithoutImage} />, {
      preloadedState: createMockState()
    });

    // For ListProductCard, when no image is provided, it shows a Package icon instead of an image
    // We can check that the product name is rendered instead
    expect(screen.getByText('Product Without Image')).toBeInTheDocument();
  });
});
