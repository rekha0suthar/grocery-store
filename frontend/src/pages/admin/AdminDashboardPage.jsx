import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProducts } from '../../store/slices/productSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import { fetchRequests } from '../../store/slices/requestSlice.js';
import Card from '../../components/UI/Card.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { Package, FolderOpen, FileText, AlertCircle, Eye } from 'lucide-react';

const AdminDashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { products, loading: productsLoading } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector((state) => state.categories);
  const { requests, loading: requestsLoading } = useAppSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 20 }));
    dispatch(fetchCategories({ limit: 10 }));
    dispatch(fetchRequests({ limit: 10 }));
  }, [dispatch]);

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const lowStockProducts = products.filter(product => product.stock < 10);
  const recentProducts = products.slice(0, 8);

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'account_register_request':
        return 'Store Manager Registration';
      case 'category_add_request':
        return 'Category Addition';
      case 'category_update_request':
        return 'Category Update';
      case 'category_delete_request':
        return 'Category Deletion';
      default:
        return 'Request';
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome, {user?.name}! Here&apos;s an overview of your store management.
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                          {request.type === 'account_register_request'
                            ? 'Store Manager Registration'
                            : getRequestTypeLabel(request.type)
                          }
                        </h4>
                        {request.type === 'account_register_request' && request.requestData?.email && (
                          <p className="text-sm text-gray-500">
                            {request.type.replace(/_/g, ' ').toUpperCase()}
                          </p>
                        )}
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
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                        <div className="flex flex-col">
                          <p className="text-sm text-gray-500">${product.price}</p>
                          {(product.weight || product.unit) && (
                            <p className="text-xs text-gray-400">
                              per {product.weight || '1'} {product.unit || 'unit'}
                            </p>
                          )}
                        </div>
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

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
              <a
                href="/admin/products"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all products
                <Eye className="w-4 h-4" />
              </a>
            </div>
          </Card.Header>
          <Card.Content>
            {recentProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
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
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {product.name}
                    </h4>
                    <div className="flex flex-col mb-2">
                      <p className="text-sm text-gray-500">${product.price}</p>
                      {(product.weight || product.unit) && (
                        <p className="text-xs text-gray-400">
                          per {product.weight || '1'} {product.unit || 'unit'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${product.stock > 10
                          ? 'bg-green-100 text-green-800'
                          : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
                <a
                  href="/admin/products"
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                >
                  Add your first product
                </a>
              </div>
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href="/admin/products"
                className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Package className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900 mb-1">Manage Products</h4>
                <p className="text-sm text-gray-500">Add, edit, or remove products</p>
              </a>

              <a
                href="/admin/categories"
                className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <FolderOpen className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900 mb-1">Manage Categories</h4>
                <p className="text-sm text-gray-500">Organize product categories</p>
              </a>

              <a
                href="/admin/requests"
                className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <FileText className="w-8 h-8 text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-gray-900 mb-1">Review Requests</h4>
                <p className="text-sm text-gray-500">Approve or reject requests</p>
              </a>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
