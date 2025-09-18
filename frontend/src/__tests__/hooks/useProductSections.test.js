import { renderHook } from '@testing-library/react';
import { useProductSections, PRODUCT_SECTION_CONFIG } from '../../hooks/useProductSections.js';

describe('useProductSections', () => {
  const mockProducts = [
    { id: 1, name: 'Product 1', isFeatured: true, discount: 0 },
    { id: 2, name: 'Product 2', isFeatured: false, discount: 10 },
    { id: 3, name: 'Product 3', isFeatured: true, discount: 5 },
    { id: 4, name: 'Product 4', isFeatured: false, discount: 0 },
    { id: 5, name: 'Product 5', isFeatured: false, discount: 15 },
  ];

  it('returns empty arrays when no products provided', () => {
    const { result } = renderHook(() => useProductSections([]));
    
    expect(result.current.featured).toEqual([]);
    expect(result.current.onSale).toEqual([]);
    expect(result.current.recent).toEqual([]);
  });

  it('filters featured products correctly', () => {
    const { result } = renderHook(() => useProductSections(mockProducts));
    
    expect(result.current.featured).toHaveLength(2);
    expect(result.current.featured[0].id).toBe(1);
    expect(result.current.featured[1].id).toBe(3);
  });

  it('filters on sale products correctly', () => {
    const { result } = renderHook(() => useProductSections(mockProducts));
    
    expect(result.current.onSale).toHaveLength(3);
    expect(result.current.onSale.every(p => p.discount > 0)).toBe(true);
  });

  it('returns recent products correctly', () => {
    const { result } = renderHook(() => useProductSections(mockProducts));
    
    expect(result.current.recent).toHaveLength(5);
    expect(result.current.recent).toEqual(mockProducts);
  });
});

describe('PRODUCT_SECTION_CONFIG', () => {
  it('has correct configuration for featured section', () => {
    expect(PRODUCT_SECTION_CONFIG.featured).toEqual({
      title: "Featured Products",
      viewAllLink: "/products?featured=true",
      viewAllText: "View all featured"
    });
  });

  it('has correct configuration for on sale section', () => {
    expect(PRODUCT_SECTION_CONFIG.onSale).toEqual({
      title: "On Sale",
      viewAllLink: "/products?sale=true",
      viewAllText: "View all sales"
    });
  });

  it('has correct configuration for recent section', () => {
    expect(PRODUCT_SECTION_CONFIG.recent).toEqual({
      title: "Latest Products",
      viewAllLink: "/products",
      viewAllText: "View all products"
    });
  });
});
