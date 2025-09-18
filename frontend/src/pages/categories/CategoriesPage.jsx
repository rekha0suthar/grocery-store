import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js';
import Card from '../../components/UI/Card.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import InfiniteScrollLoader from '../../components/UI/InfiniteScrollLoader.jsx';
import { FolderOpen, Package, ArrowRight } from 'lucide-react';

const CategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { 
    categories, 
    loading, 
    loadingMore, 
    pagination,
    error 
  } = useAppSelector((state) => state.categories);

  // Load more categories function
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      dispatch(loadMoreCategories({ limit: 5 }));
    }
  }, [dispatch, loadingMore, pagination.hasMore]);

  // Set up infinite scroll
  const lastElementRef = useInfiniteScroll(loadMore, pagination.hasMore, loadingMore);

  useEffect(() => {
    dispatch(resetPagination());
    dispatch(fetchCategories({ limit: 5 }));
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(loadMoreCategories({ limit: 5 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Browse products by category</p>
        </div>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              All Categories
              {pagination.total > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.total} total)
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500">Scroll to load more categories</p>
          </Card.Header>
          <Card.Content>
            {categories.length > 0 ? (
              <>
                <div className="space-y-4">
                  {categories.map((category, index) => {
                    const isLastElement = index === categories.length - 1;
                    const ref = isLastElement ? lastElementRef : null;
                    
                    return (
                      <Link
                        key={category.id}
                        to={`/products?category=${category.id}`}
                        ref={ref}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-200 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center group-hover:bg-green-100">
                          <FolderOpen className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-700">
                            {category.name}
                          </h4>
                          <p className="text-sm text-gray-500">{category.description}</p>
                          {category.parent && (
                            <p className="text-xs text-gray-400">Parent: {category.parent.name}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-500">
                            {category.productCount || 0} products
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Infinite scroll loader */}
                <InfiniteScrollLoader
                  loading={loadingMore}
                  hasMore={pagination.hasMore}
                  error={error}
                  onRetry={handleRetry}
                />
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No categories found</p>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-200 transition-colors group"
              >
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-green-700">View All Products</h4>
                  <p className="text-sm text-gray-500">Browse all available products</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 ml-auto" />
              </Link>
              
              <Link
                to="/products?featured=true"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-200 transition-colors group"
              >
                <Package className="w-8 h-8 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-green-700">Featured Products</h4>
                  <p className="text-sm text-gray-500">View featured products</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 ml-auto" />
              </Link>
              
              <Link
                to="/products?sale=true"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-200 transition-colors group"
              >
                <Package className="w-8 h-8 text-red-600" />
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-green-700">Sale Items</h4>
                  <p className="text-sm text-gray-500">View products on sale</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 ml-auto" />
              </Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default CategoriesPage;
