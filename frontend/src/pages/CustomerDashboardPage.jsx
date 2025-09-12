import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { fetchProducts } from '../store/slices/productSlice.js';
import { fetchCategories } from '../store/slices/categorySlice.js';
import Card from '../components/UI/Card.jsx';
import Button from '../components/UI/Button.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import { 
  Package, 
  ShoppingCart,
  Star,
  Search,
  Filter,
  Heart,
  Eye,
  ArrowRight,
  TrendingUp,
  Clock,
  Tag
} from 'lucide-react';

const CustomerDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    dispatch(fetchCategories({ limit: 8 }));
  }, [dispatch]);

  const featuredProducts = products.filter(product => product.isFeatured).slice(0, 6);
  const recentProducts = products.slice(0, 8);
  const onSaleProducts = products.filter(product => product.discount && product.discount > 0).slice(0, 4);

  const stats = [
    {
      name: 'Available Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Categories',
      value: categories.length,
      icon: Tag,
      color: 'bg-green-500',
      change: '+3',
      changeType: 'positive'
    },
    {
      name: 'Featured Items',
      value: featuredProducts.length,
      icon: Star,
      color: 'bg-yellow-500',
      change: '+2',
      changeType: 'positive'
    },
    {
      name: 'On Sale',
      value: onSaleProducts.length,
      icon: TrendingUp,
      color: 'bg-red-500',
      change: '+5',
      changeType: 'positive'
    }
  ];

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <Button
                variant="outline"
                onClick={() => window.location.href = '/products'}
              >
                <Search className="w-4 h-4 mr-2" />
                Browse All Products
              </Button>
              <Button
                onClick={() => window.location.href = '/products'}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Start Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last week
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <Link
                to="/products?featured=true"
                className="text-green-600 hover:text-green-700 font-medium flex items-center"
              >
                View all featured
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={product.imageUrl || '/api/placeholder/300/200'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">4.5</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      {product.discount && (
                        <span className="text-sm text-red-600 line-through">
                          ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
       

        {/* On Sale Products */}
        {onSaleProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">On Sale</h2>
              <Link
                to="/products?sale=true"
                className="text-green-600 hover:text-green-700 font-medium flex items-center"
              >
                View all sales
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSaleProducts.map((product) => (
                <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={product.imageUrl || '/api/placeholder/300/200'}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{product.discount}%
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mt-4 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      <span className="text-sm text-red-600 line-through">
                        ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                      </span>
                    </div>
                    <Button size="sm">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Products */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Products</h2>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View all products
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={product.imageUrl || '/api/placeholder/300/200'}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardPage; 