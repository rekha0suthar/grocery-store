import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchCategories, fetchCategoryTree } from '../../store/slices/categorySlice.js';
import Card from '../../components/UI/Card.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { FolderOpen, ChevronRight } from 'lucide-react';

const CategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { categories, categoryTree, loading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  const renderCategoryTree = (tree, level = 0) => {
    return tree.map((category) => (
      <div key={category.id} className={`${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-center space-x-2 p-3 hover:bg-gray-50 rounded-md">
          <FolderOpen className="w-5 h-5 text-gray-400" />
          <span className="text-gray-900">{category.name}</span>
          {category.productCount && (
            <span className="text-sm text-gray-500">({category.productCount} products)</span>
          )}
        </div>
        {category.children && category.children.length > 0 && (
          <div className="mt-2">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
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
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600">Browse products by category</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Tree */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">Category Tree</h3>
          </Card.Header>
          <Card.Content>
            {categoryTree.length > 0 ? (
              <div className="space-y-1">
                {renderCategoryTree(categoryTree)}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No categories found</p>
            )}
          </Card.Content>
        </Card>

        {/* Categories List */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">All Categories</h3>
          </Card.Header>
          <Card.Content>
            {categories.length > 0 ? (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-500">{category.description}</p>
                      {category.parent && (
                        <p className="text-xs text-gray-400">Parent: {category.parent.name}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.productCount || 0} products
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

export default CategoriesPage;
