import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { fetchProducts } from '../store/slices/productSlice.js';
import { fetchCategories } from '../store/slices/categorySlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import { toast } from 'react-hot-toast';

import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import ProductSection from '../components/UI/ProductSection.jsx';
import DashboardHeader from '../components/UI/DashboardHeader.jsx';
import EmptyState from '../components/UI/EmptyState.jsx';

import { useProductSections, PRODUCT_SECTION_CONFIG } from '../hooks/useProductSections.js';

import { Package, ShoppingCart, FolderOpen } from 'lucide-react';


const CustomerDashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { loading: categoriesLoading } = useAppSelector((state) => state.categories);

  const { featured, onSale, recent } = useProductSections(products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    dispatch(fetchCategories({ limit: 8 }));
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const emptyStateActions = [
    {
      text: "Browse Products",
      icon: ShoppingCart,
      onClick: () => navigate('/products'),
      className: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
    },
    {
      text: "Browse Categories", 
      icon: FolderOpen,
      onClick: () => navigate('/categories'),
      className: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
    },
    {
      text: "Refresh Page",
      onClick: () => window.location.reload(),
      className: "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
    }
  ];

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader userName={user?.name} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon={Package}
            title="No Products Available"
            message="We're currently updating our product catalog. Please check back later or contact support."
            actions={emptyStateActions}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName={user?.name} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductSection
          title={PRODUCT_SECTION_CONFIG.featured.title}
          products={featured}
          viewAllLink={PRODUCT_SECTION_CONFIG.featured.viewAllLink}
          viewAllText={PRODUCT_SECTION_CONFIG.featured.viewAllText}
          onAddToCart={handleAddToCart}
          showSection={featured.length > 0}
        />

        <ProductSection
          title={PRODUCT_SECTION_CONFIG.onSale.title}
          products={onSale}
          viewAllLink={PRODUCT_SECTION_CONFIG.onSale.viewAllLink}
          viewAllText={PRODUCT_SECTION_CONFIG.onSale.viewAllText}
          onAddToCart={handleAddToCart}
          showSection={onSale.length > 0}
        />

        <ProductSection
          title={PRODUCT_SECTION_CONFIG.recent.title}
          products={recent}
          viewAllLink={PRODUCT_SECTION_CONFIG.recent.viewAllLink}
          viewAllText={PRODUCT_SECTION_CONFIG.recent.viewAllText}
          onAddToCart={handleAddToCart}
          showSection={recent.length > 0}
        />
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
