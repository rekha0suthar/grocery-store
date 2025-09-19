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
  FolderOpen, 
  AlertCircle,
  Eye,
  Plus,
  ArrowUpRight,
  Star,
  CheckCircle,
} from 'lucide-react';

const ModernDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 10 }));
    dispatch(fetchCategories({ limit: 10 }));
  }, [dispatch]);

  const lowStockProducts = products.filter(product => product.stock < 10);
  const recentProducts = products.slice(0, 6);

  const getRoutes = () => {
    switch (user?.role) {
      case 'admin':
        return {
          products: '/admin/products',
          categories: '/admin/categories',
          viewProducts: '/products'
        };
      case 'store_manager':
        return {
          products: '/manager/products',
          categories: '/manager/categories',
          viewProducts: '/products'
        };
      default:
        return {
          products: '/products',
          categories: '/categories',
          viewProducts: '/products'
        };
    }
  };

  const routes = getRoutes();

  const stats = [
    {
      name: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Categories',
      value: categories.length,
      icon: FolderOpen,
      color: 'bg-green-500',
      change: '+3',
      changeType: 'positive',
    },
    {
      name: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: lowStockProducts.length > 0 ? `${lowStockProducts.length} items` : 'All stocked',
      changeType: lowStockProducts.length > 0 ? 'negative' : 'positive',
    },
  ];

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || user?.email}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here&apos;s what&apos;s happening with your grocery store today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to={routes.viewProducts}>
                <Button variant="outline" className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View Products
                </Button>
              </Link>
              <Link to={routes.products}>
                <Button className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' :
                        stat.changeType === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <ArrowUpRight className={`w-4 h-4 ml-1 ${
                        stat.changeType === 'positive' ? 'text-green-600' :
                        stat.changeType === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Products</h3>
                <Link to={routes.viewProducts}>
                  <Button variant="outline" size="sm" className="flex items-center">
                    View All
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              {recentProducts.length > 0 ? (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">{product.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{product.description}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-lg font-bold text-green-600">${product.price}</span>
                          <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock} in stock
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">4.5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first product</p>
                  <Link to={routes.products}>
                    <Button className="flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {lowStockProducts.length}
                </span>
              </div>
              
              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-red-600 font-medium">
                          Only {product.stock} left in stock
                        </p>
                      </div>
                    </div>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <Link to={routes.products}>
                      <Button variant="outline" size="sm" className="w-full">
                        Manage Stock
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All products well stocked</p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to={routes.products} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Products
                  </Button>
                </Link>
                <Link to={routes.categories} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Manage Categories
                  </Button>
                </Link>
                <Link to={routes.viewProducts} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    View Store
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboardPage;
