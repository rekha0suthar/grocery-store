import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { toggleSidebar } from '../../store/slices/uiSlice.js';
import { openCart } from '../../store/slices/cartSlice.js';
import { logoutUser } from '../../store/slices/authSlice.js';
import { searchProducts } from '../../store/slices/productSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import { toggleWishlistItem } from '../../store/slices/wishlistSlice.js';
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
  Package
} from 'lucide-react';
import Button from '../UI/Button.jsx';

const ModernHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { categories } = useAppSelector((state) => state.categories);
  const { items: wishlistItems } = useAppSelector((state) => state.wishlist);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 10 }));
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchProducts({ q: searchQuery }));
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleWishlistClick = () => {
    navigate('/wishlist');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="bg-green-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Free delivery on orders over $50</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                <span>Call us: (555) 123-4567</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span>Welcome, {user.name || user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="hover:text-green-200 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="hover:text-green-200 transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="hover:text-green-200 transition-colors">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FreshMart</h1>
                <p className="text-xs text-gray-500">Fresh Groceries</p>
              </div>
            </div>
          </Link>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4"
                  size="sm"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <button className="md:hidden p-2 text-gray-500 hover:text-gray-700">
              <Search className="w-6 h-6" />
            </button>

            <button 
              onClick={handleWishlistClick}
              className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Heart className="w-6 h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => dispatch(openCart())}
              className="relative p-2 text-gray-500 hover:text-gray-700"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <Link
                    to="/orders"
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="My Orders"
                  >
                    <Package className="w-4 h-4" />
                  </Link>
                <button
                  onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => dispatch(toggleSidebar())}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-3 overflow-x-auto">
            <Link to="/products" className="text-gray-700 hover:text-green-600 font-medium transition-colors whitespace-nowrap">
              All Products
            </Link>
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors whitespace-nowrap"
              >
                {category.name}
            </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default ModernHeader;
