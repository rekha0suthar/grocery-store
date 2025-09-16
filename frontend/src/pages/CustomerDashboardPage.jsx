import GridProductCard from "../components/UI/GridProductCard.jsx";
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { fetchProducts } from '../store/slices/productSlice.js';
import { fetchCategories } from '../store/slices/categorySlice.js';
import { addToCart } from '../store/slices/cartSlice.js';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import { 
  Package, 
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CustomerDashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { loading: categoriesLoading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    dispatch(fetchCategories({ limit: 8 }));
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const featuredProducts = (products || []).filter(product => product.isFeatured).slice(0, 6);
  const recentProducts = (products || []).slice(0, 8);
  const onSaleProducts = (products || []).filter(product => product.discount && product.discount > 0).slice(0, 4);



  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || 'Customer'}!
                </h1>
                <p className="mt-2 text-gray-600">
                  Discover amazing products and start shopping
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigate('/products');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                  style={{ 
                    pointerEvents: 'auto', 
                    zIndex: 999, 
                    position: 'relative'
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Start Shopping
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products Available</h2>
            <p className="text-gray-600 mb-6">
              We&apos;re currently updating our product catalog. Please check back later or contact support.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Browse Products
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Customer'}!
              </h1>
              <p className="mt-2 text-gray-600">
                Discover amazing products and start shopping
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  navigate('/products');
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                style={{ 
                  pointerEvents: 'auto', 
                  zIndex: 999, 
                  position: 'relative',
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <Link
                to="/products?featured=true"
                className="text-green-600 hover:text-green-700 font-medium flex items-center cursor-pointer z-10 relative"
                style={{ pointerEvents: 'auto' }}
              >
                View all featured
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredProducts.map((product) => {
                return (
                  <GridProductCard 
                    key={product.id || product._id || Math.random()} 
                    product={product} 
                    showAddToCart={true}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          </div>
        )}

        {onSaleProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">On Sale</h2>
              <Link
                to="/products?sale=true"
                className="text-green-600 hover:text-green-700 font-medium flex items-center cursor-pointer z-10 relative"
                style={{ pointerEvents: 'auto' }}
              >
                View all sales
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {onSaleProducts.map((product) => {
                return (
                  <GridProductCard 
                    key={product.id || product._id || Math.random()} 
                    product={product} 
                    showAddToCart={true}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-medium flex items-center cursor-pointer z-10 relative"
              style={{ pointerEvents: 'auto' }}
            >
              View all products
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentProducts.map((product) => {
              return (
                <GridProductCard 
                  key={product.id || product._id || Math.random()} 
                  product={product} 
                  showAddToCart={true}
                  onAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
