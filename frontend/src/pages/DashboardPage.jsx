import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux.js';
import { fetchProducts } from '../store/slices/productSlice.js';
import { fetchCategories } from '../store/slices/categorySlice.js';
import Card from '../components/UI/Card.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import { Package, FolderOpen, ShoppingCart, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { totalItems, totalPrice } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 5 }));
    dispatch(fetchCategories({ limit: 5 }));
  }, [dispatch]);

  const stats = [
    {
      name: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Categories',
      value: categories.length,
      icon: FolderOpen,
      color: 'bg-green-500',
    },
    {
      name: 'Cart Items',
      value: totalItems,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      name: 'Cart Total',
      value: `$${totalPrice.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your grocery store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
          </Card.Header>
          <Card.Content>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">${product.price}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No products found</p>
            )}
          </Card.Content>
        </Card>

        {/* Recent Categories */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          </Card.Header>
          <Card.Content>
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No categories found</p>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
