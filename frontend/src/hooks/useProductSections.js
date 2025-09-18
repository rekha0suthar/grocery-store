import { useMemo } from 'react';

/**
 * useProductSections Hook
 * 
 * Custom hook that handles product filtering and sectioning logic.
 * Follows Clean Architecture principles:
 * - Separation of Concerns: Business logic separated from UI
 * - Single Responsibility: Only handles product sectioning
 * - Reusability: Can be used across different components
 */
export const useProductSections = (products = []) => {
  const productSections = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        featured: [],
        onSale: [],
        recent: []
      };
    }

    return {
      featured: products.filter(product => product.isFeatured).slice(0, 6),
      onSale: products.filter(product => product.discount && product.discount > 0).slice(0, 4),
      recent: products.slice(0, 8)
    };
  }, [products]);

  return productSections;
};

/**
 * Product Section Configuration
 * 
 * Configuration object that defines the structure of each product section.
 * This follows the Configuration pattern from Clean Architecture.
 */
export const PRODUCT_SECTION_CONFIG = {
  featured: {
    title: "Featured Products",
    viewAllLink: "/products?featured=true",
    viewAllText: "View all featured"
  },
  onSale: {
    title: "On Sale",
    viewAllLink: "/products?sale=true", 
    viewAllText: "View all sales"
  },
  recent: {
    title: "Latest Products",
    viewAllLink: "/products",
    viewAllText: "View all products"
  }
};
