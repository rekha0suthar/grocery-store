import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { fetchProducts, loadMoreProducts, searchProducts, clearSearch, resetPagination } from '../../store/slices/productSlice.js';
import { fetchCategories } from '../../store/slices/categorySlice.js';
import { addToCart } from '../../store/slices/cartSlice.js';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll.js';
import Card from '../../components/UI/Card.jsx';
import GridProductCard from '../../components/UI/GridProductCard.jsx';
import ListProductCard from '../../components/UI/ListProductCard.jsx';
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx';
import InfiniteScrollLoader from '../../components/UI/InfiniteScrollLoader.jsx';
import { 
  Package, 
  Grid, 
  List,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ModernProductsPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { 
    products, 
    loading, 
    loadingMore, 
    searchResults, 
    searchLoading, 
    isSearchActive, 
    pagination,
    error 
  } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');
  const sale = searchParams.get('sale');

  // Build query parameters for API calls
  const buildQueryParams = useCallback(() => {
    const params = { limit: 12};
    
    if (category) params.category = category;
    if (featured === 'true') params.featured = true;
    if (sale === 'true') params.sale = true;
    
    return params;
  }, [category, featured, sale]);

  // Load more products function
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore && !isSearchActive) {
      dispatch(loadMoreProducts(buildQueryParams()));
    }
  }, [dispatch, loadingMore, pagination.hasMore, isSearchActive, buildQueryParams]);

  // Set up infinite scroll
  const lastElementRef = useInfiniteScroll(loadMore, pagination.hasMore, loadingMore);

  // Initial data loading
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories({ limit: 12 }));
    }
    
    if (search) {
      dispatch(searchProducts({ q: search }));
    } else {
      dispatch(clearSearch());
      dispatch(resetPagination());
      dispatch(fetchProducts(buildQueryParams()));
    }
  }, [dispatch, searchParams, categories.length, category, featured, sale, search, buildQueryParams]);

  const handleAddToCart = (product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('This product is out of stock!');
      return;
    }
    
    const currentCartItem = cartItems.find(item => item.productId === product.id);
    const currentQuantity = currentCartItem ? currentCartItem.quantity : 0;
    
    if (product.stock !== undefined && (currentQuantity + 1) > product.stock) {
      toast.error(`Only ${product.stock} items available in stock!`);
      return;
    }
    
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleRetry = () => {
    dispatch(loadMoreProducts(buildQueryParams()));
  };

  let displayProducts = search ? searchResults : products;

  if (featured === 'true') {
    displayProducts = displayProducts.filter(product => product.isFeatured);
  } else if (sale === 'true') {
    displayProducts = displayProducts.filter(product => product.discount && product.discount > 0);
  }

  const getPageTitle = () => {
    if (search) return `Search Results for "${search}"`;
    if (featured === 'true') return 'Featured Products';
    if (sale === 'true') return 'Products on Sale';
    if (category) {
      const categoryObj = categories.find(cat => cat.id.toString() === category);
      return categoryObj ? `${categoryObj.name} Products` : 'Category Products';
    }
    return 'All Products';
  };

  const sortedProducts = [...displayProducts].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'stock':
        aValue = a.stock || 0;
        bValue = b.stock || 0;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="mt-2 text-gray-600">
                {pagination.total > 0 ? `${pagination.total} products found` : `${sortedProducts.length} products found`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex-1">
            {sortedProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isSearchActive ? `No products found for "${search}"` : 'No products found'}
                </h3>
                <p className="text-gray-500">
                  {isSearchActive ? 'Try adjusting your search terms.' : 'Try adjusting your filter criteria.'}
                </p>
              </Card>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {sortedProducts.map((product, index) => {
                    const isLastElement = index === sortedProducts.length - 1;
                    const ref = isLastElement && !isSearchActive ? lastElementRef : null;
                    
                    return viewMode === 'grid' ? (
                      <div key={product.id} ref={ref}>
                        <GridProductCard 
                          product={product} 
                          showAddToCart={true}
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    ) : (
                      <div key={product.id} ref={ref}>
                        <ListProductCard 
                          product={product} 
                          showAddToCart={true}
                          onAddToCart={handleAddToCart}
                        />
                      </div>
                    );
                  })}
                </div>
                
                {/* Infinite scroll loader */}
                {!isSearchActive && (
                  <InfiniteScrollLoader
                    loading={loadingMore}
                    hasMore={pagination.hasMore}
                    error={error}
                    onRetry={handleRetry}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProductsPage;
