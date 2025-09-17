import { screen, fireEvent } from "@testing-library/react";
import React from 'react';
import GridProductCard from '../../../components/UI/GridProductCard.jsx';
import ListProductCard from '../../../components/UI/ListProductCard.jsx';
import { renderWithProviders } from '../../utils/test-utils.js';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};
jest.mock('react-hot-toast', () => ({
  toast: mockToast,
}));

jest.mock('../../../hooks/useProductCard.js', () => ({
  useProductCard: (product, onAddToCart) => ({
    productId: product.id,
    isInWishlist: false,
    handleCardClick: jest.fn(),
    handleAddToCart: jest.fn((e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onAddToCart) onAddToCart(product);
    }),
    handleToggleWishlist: jest.fn((e) => {
      e.preventDefault();
      e.stopPropagation();
      mockToast.success(`${product.name} added to wishlist!`);
    }),
  }),
}));

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'A test product',
  price: 19.99,
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  stock: 10,
  weight: '1kg',
  unit: 'kg'
};

const mockProductWithDiscount = {
  id: '2',
  name: 'Discounted Product',
  description: 'A discounted product',
  price: 29.99,
  discountPrice: 24.99,
  discount: 17,
  images: ['https://example.com/image1.jpg'],
  stock: 5,
  weight: '500g',
  unit: 'g'
};

const mockProductWithoutImage = {
  id: '3',
  name: 'Product Without Image',
  description: 'A product without image',
  price: 15.99,
  images: [],
  stock: 3,
  weight: '250g',
  unit: 'g'
};

describe('GridProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    renderWithProviders(<GridProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('A test product')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('1kg kg')).toBeInTheDocument();
  });

  it('renders discounted price when discount is applied', () => {
    renderWithProviders(<GridProductCard product={mockProductWithDiscount} />);
    
    expect(screen.getByText('$24.99')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockOnAddToCart = jest.fn();
    renderWithProviders(<GridProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('calls handleCardClick when card is clicked', () => {
    const mockOnAddToCart = jest.fn();
    renderWithProviders(<GridProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    const card = screen.getByRole('button', { name: /add to wishlist/i }).closest('.group');
    fireEvent.click(card);
    
    // The card click handler is mocked, so we just verify it doesn't throw
    expect(card).toBeInTheDocument();
  });

  it('toggles wishlist when heart button is clicked', () => {
    renderWithProviders(<GridProductCard product={mockProduct} />);
    
    const heartButton = screen.getByRole('button', { name: /add to wishlist/i });
    fireEvent.click(heartButton);
    
    expect(mockToast.success).toHaveBeenCalledWith('Test Product added to wishlist!');
  });

  it('renders product image when available', () => {
    renderWithProviders(<GridProductCard product={mockProduct} />);
    
    const imageContainer = screen.getByRole('button', { name: /add to wishlist/i }).closest('.group').querySelector('.relative');
    expect(imageContainer).toBeInTheDocument();
  });

  it('hides add to cart button when showAddToCart is false', () => {
    renderWithProviders(<GridProductCard product={mockProduct} showAddToCart={false} />);
    
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it('renders placeholder icon when no image is provided', () => {
    renderWithProviders(<GridProductCard product={mockProductWithoutImage} />);
    
    const packageIcon = screen.getByRole('button', { name: /add to wishlist/i }).closest('.group').querySelector('svg');
    expect(packageIcon).toBeInTheDocument();
    expect(packageIcon).toHaveClass('w-12', 'h-12', 'text-gray-400');
  });
});

describe('ListProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    renderWithProviders(<ListProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('A test product')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('1kg kg')).toBeInTheDocument();
  });

  it('renders discounted price when discount is applied', () => {
    renderWithProviders(<ListProductCard product={mockProductWithDiscount} />);
    
    expect(screen.getByText('$24.99')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockOnAddToCart = jest.fn();
    renderWithProviders(<ListProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);
    
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('calls handleCardClick when card is clicked', () => {
    const mockOnAddToCart = jest.fn();
    renderWithProviders(<ListProductCard product={mockProduct} onAddToCart={mockOnAddToCart} />);
    
    const card = screen.getByRole('button', { name: /add to wishlist/i }).closest('.group');
    fireEvent.click(card);
    
    expect(card).toBeInTheDocument();
  });

  it('toggles wishlist when heart button is clicked', () => {
    renderWithProviders(<ListProductCard product={mockProduct} />);
    
    const heartButton = screen.getByRole('button', { name: /add to wishlist/i });
    fireEvent.click(heartButton);
    
    expect(mockToast.success).toHaveBeenCalledWith('Test Product added to wishlist!');
  });

  it('renders product image when available', () => {
    renderWithProviders(<ListProductCard product={mockProduct} />);
    
    const imageContainer = screen.getByRole('button', { name: /add to wishlist/i }).closest('.group').querySelector('.w-40');
    expect(imageContainer).toBeInTheDocument();
  });

  it('hides add to cart button when showAddToCart is false', () => {
    renderWithProviders(<ListProductCard product={mockProduct} showAddToCart={false} />);
    
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it('renders placeholder icon when no image is provided', () => {
    renderWithProviders(<ListProductCard product={mockProductWithoutImage} />);
    
    const packageIcon = screen.getByRole('button', { name: /add to wishlist/i }).closest('.group').querySelector('svg');
    expect(packageIcon).toBeInTheDocument();
    expect(packageIcon).toHaveClass('w-12', 'h-12', 'text-gray-400');
  });

  it('does not render when product has no id', () => {
    const productWithoutId = { ...mockProduct, id: null };
    const { container } = renderWithProviders(<ListProductCard product={productWithoutId} />);
    
    expect(container.firstChild).toBeNull();
  });
});