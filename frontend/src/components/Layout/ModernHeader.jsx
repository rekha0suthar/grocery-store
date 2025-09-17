import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { toggleSidebar } from '../../store/slices/uiSlice.js';
import { openCart } from '../../store/slices/cartSlice.js';
import { logoutUser } from '../../store/slices/authSlice.js';
import { searchProducts } from '../../store/slices/productSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import { toast } from 'react-hot-toast';
import { 
  Menu, 
  ShoppingCart, 
  User, 
  LogOut, 
  Search, 
  Heart,
  MapPin,
  Phone,
  Package,
  ShoppingBag
} from 'lucide-react';
import Button from '../UI/Button.jsx';

const ModernHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { categories } = useAppSelector((state) => state.categories);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = searchParams.get('category');

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories({ limit: 10 }));
    }
  }, [dispatch, categories.length]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchProducts({ query: searchQuery.trim() }));
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="bg-green-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Free delivery on orders over $50</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Call us: (555) 123-4567</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Welcome to FreshMart!</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">FreshMart</span>
            </Link>
          </div>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/products')}
              className="md:hidden p-2 text-gray-600 hover:text-green-600"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Orders Icon - Only show for authenticated users */}
            {isAuthenticated && (
              <button
                onClick={() => navigate('/orders')}
                className="p-2 text-gray-600 hover:text-green-600"
                title="My Orders"
              >
                <ShoppingBag className="w-6 h-6" />
              </button>
            )}

            <button
              onClick={() => navigate('/wishlist')}
              className="relative p-2 text-gray-600 hover:text-green-600"
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => dispatch(openCart())}
              className="relative p-2 text-gray-600 hover:text-green-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || user?.name || 'User'}
                  </span>
                  {user?.role && (
                    <span className="text-xs text-gray-500">
                      ({user.role})
                    </span>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            <button
              onClick={() => dispatch(toggleSidebar())}
              className="md:hidden p-2 text-gray-600 hover:text-green-600"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-2 overflow-x-auto scrollbar-hide">
            <Link
              to="/products"
              className={`font-medium text-sm transition-colors whitespace-nowrap px-3 py-1.5 rounded-full ${
                !currentCategory
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              All Products
            </Link>
            {categories && categories.length > 0 && categories.map((category) => {
              if (!category || !category.id || !category.name) {
                return null;
              }
              
              const categoryId = String(category.id);
              const isActive = currentCategory === categoryId;
              
              return (
                <Link
                  key={categoryId}
                  to={`/products?category=${categoryId}`}
                  className={`font-medium text-sm transition-colors whitespace-nowrap px-3 py-1.5 rounded-full ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default ModernHeader;
