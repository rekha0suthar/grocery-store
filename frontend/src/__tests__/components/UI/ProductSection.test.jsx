import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductSection from '../../../components/UI/ProductSection.jsx';

// Mock GridProductCard component
jest.mock('../../../components/UI/GridProductCard.jsx', () => {
  return function MockGridProductCard({ product }) {
    return <div data-testid={`product-${product.id}`}>{product.name}</div>;
  };
});

const mockProducts = [
  { id: 1, name: 'Product 1', price: 10.99 },
  { id: 2, name: 'Product 2', price: 15.99 },
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProductSection', () => {
  it('renders section with title and products', () => {
    renderWithRouter(
      <ProductSection
        title="Test Products"
        products={mockProducts}
        viewAllLink="/test"
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.getByText('Test Products')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('renders view all link when provided', () => {
    renderWithRouter(
      <ProductSection
        title="Test Products"
        products={mockProducts}
        viewAllLink="/test"
        viewAllText="View All Test"
        onAddToCart={jest.fn()}
      />
    );

    const viewAllLink = screen.getByText('View All Test');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/test');
  });

  it('does not render when showSection is false', () => {
    renderWithRouter(
      <ProductSection
        title="Test Products"
        products={mockProducts}
        showSection={false}
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.queryByText('Test Products')).not.toBeInTheDocument();
  });

  it('does not render when no products and no empty state message', () => {
    renderWithRouter(
      <ProductSection
        title="Test Products"
        products={[]}
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.queryByText('Test Products')).not.toBeInTheDocument();
  });

  it('renders empty state message when no products but message provided', () => {
    renderWithRouter(
      <ProductSection
        title="Test Products"
        products={[]}
        emptyStateMessage="No products available"
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.getByText('Test Products')).toBeInTheDocument();
    expect(screen.getByText('No products available')).toBeInTheDocument();
  });

  it('does not render view all link when no products', () => {
    renderWithRouter(
      <ProductSection
        title="Test Products"
        products={[]}
        viewAllLink="/test"
        emptyStateMessage="No products available"
        onAddToCart={jest.fn()}
      />
    );

    expect(screen.queryByText('View all')).not.toBeInTheDocument();
  });
});
