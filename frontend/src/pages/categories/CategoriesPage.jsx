import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import Card from '../../components/UI/Card.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import { FolderOpen, ArrowRight } from 'lucide-react';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { categories, loading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-600">Browse products by category</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <Card.Header>
              <h3 className="text-xl font-semibold text-gray-900">All Categories</h3>
            </Card.Header>
            <Card.Content>
              {categories.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex items-center space-x-4 p-6 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
                        <FolderOpen className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          {category.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {category.description}
                        </p>
                        {category.parent && (
                          <p className="text-xs text-gray-400 mt-1">
                            Parent: {category.parent.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {category.productCount || 0}  {category.productCount === 1  || category.productCount === 0 ? 'product' : 'products'}
                          </div>                   
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-500">Categories will appear here once they are created.</p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
