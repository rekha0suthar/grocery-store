import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProducts } from '../../store/slices/productSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import { fetchRequests } from '../../store/slices/requestSlice.js';
import Card from '../../components/UI/Card.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { Package, FolderOpen, FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { requests, loading: requestsLoading } = useAppSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 10 }));
    dispatch(fetchCategories({ limit: 10 }));
    dispatch(fetchRequests({ limit: 10 }));
  }, [dispatch]);

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const lowStockProducts = products.filter(product => product.stock < 10);

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
      name: 'Pending Requests',
      value: pendingRequests.length,
      icon: FileText,
      color: 'bg-yellow-500',
    },
    {
      name: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: AlertCircle,
      color: 'bg-red-500',
    },
  ];

  if (productsLoading || categoriesLoading || requestsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {user?.name}! Here's an overview of your store management.
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
          </Card.Header>
          <Card.Content>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Store Manager Request
                      </h4>
                      <p className="text-sm text-gray-500">
                        From: {request.user?.name || request.user?.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      PENDING
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No pending requests</p>
            )}
          </Card.Content>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </Card.Header>
          <Card.Content>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
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
                    <div className="text-sm text-red-600 font-medium">
                      {product.stock} left
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">All products are well stocked</p>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/products"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Products</h4>
              <p className="text-sm text-gray-500">Add, edit, or remove products</p>
            </a>
            
            <a
              href="/admin/categories"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="w-8 h-8 text-green-500 mb-2" />
              <h4 className="font-medium text-gray-900">Manage Categories</h4>
              <p className="text-sm text-gray-500">Organize product categories</p>
            </a>
            
            <a
              href="/admin/requests"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-8 h-8 text-yellow-500 mb-2" />
              <h4 className="font-medium text-gray-900">Review Requests</h4>
              <p className="text-sm text-gray-500">Approve or reject requests</p>
            </a>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
