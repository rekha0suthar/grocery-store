import productSlice, {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  clearProducts,
  clearCurrentProduct,
  clearError
} from '../../store/slices/productSlice.js';

describe('productSlice', () => {
  const initialState = {
    products: [],
    currentProduct: null,
    searchResults: [],
    loading: false,
    loadingMore: false,
    searchLoading: false,
    isSearchActive: false,
    error: null,
    pagination: {
      page: 1,
      limit: 5,
      total: 0,
      pages: 0,
      hasMore: false
    }
  };

  it('should return the initial state', () => {
    expect(productSlice(undefined, {})).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const action = clearError();
    const newState = productSlice(stateWithError, action);
    expect(newState.error).toBeNull();
  });

  it('should handle clearProducts', () => {
    const stateWithProducts = { 
      ...initialState, 
      products: [{ id: '1', name: 'Product 1' }],
      searchResults: [{ id: '2', name: 'Product 2' }],
      isSearchActive: true
    };
    const action = clearProducts();
    const newState = productSlice(stateWithProducts, action);
    expect(newState.products).toEqual([]);
    expect(newState.searchResults).toEqual([]);
    expect(newState.isSearchActive).toBe(false);
    expect(newState.pagination).toEqual({
      page: 1,
      limit: 5,
      total: 0,
      pages: 0,
      hasMore: false
    });
  });

  it('should handle clearCurrentProduct', () => {
    const stateWithCurrentProduct = { 
      ...initialState, 
      currentProduct: { id: '1', name: 'Product 1' } 
    };
    const action = clearCurrentProduct();
    const newState = productSlice(stateWithCurrentProduct, action);
    expect(newState.currentProduct).toBeNull();
  });

  it('should handle fetchProducts.fulfilled', () => {
    const products = [
      { id: '1', name: 'Product 1', price: 10.99 },
      { id: '2', name: 'Product 2', price: 15.99 }
    ];
    const pagination = {
      page: 1,
      limit: 12,
      total: 2,
      pages: 1,
      hasMore: false
    };
    const action = fetchProducts.fulfilled({ products, pagination, isInitialLoad: true });
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.products).toEqual(products);
    expect(newState.pagination).toEqual({
      ...pagination,
      hasMore: pagination.page < pagination.pages
    });
    expect(newState.error).toBeNull();
  });

  it('should handle fetchProducts.rejected', () => {
    const error = 'Failed to fetch products';
    const action = fetchProducts.rejected(new Error(error), 'requestId', {}, error);
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(error);
  });

  it('should handle fetchProductById.fulfilled', () => {
    const product = { id: '1', name: 'Product 1', price: 10.99 };
    const action = fetchProductById.fulfilled(product, 'requestId', '1');
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.currentProduct).toEqual(product);
    expect(newState.error).toBeNull();
  });

  it('should handle createProduct.fulfilled', () => {
    const newProduct = { id: '3', name: 'New Product', price: 20.99 };
    const action = createProduct.fulfilled(newProduct, 'requestId', {});
    const newState = productSlice(initialState, action);
    expect(newState.products).toContain(newProduct);
  });

  it('should handle updateProduct.fulfilled', () => {
    const stateWithProduct = {
      ...initialState,
      products: [{ id: '1', name: 'Product 1', price: 10.99 }]
    };
    const updatedProduct = { id: '1', name: 'Updated Product', price: 12.99 };
    const action = updateProduct.fulfilled(updatedProduct, 'requestId', { id: '1', productData: {} });
    const newState = productSlice(stateWithProduct, action);
    expect(newState.products[0]).toEqual(updatedProduct);
  });

  it('should handle deleteProduct.fulfilled', () => {
    const stateWithProduct = {
      ...initialState,
      products: [{ id: '1', name: 'Product 1', price: 10.99 }]
    };
    const action = deleteProduct.fulfilled('1', 'requestId', '1');
    const newState = productSlice(stateWithProduct, action);
    expect(newState.products).toEqual([]);
  });

  it('should handle searchProducts.fulfilled', () => {
    const searchResults = [
      { id: '1', name: 'Search Result 1', price: 10.99 }
    ];
    const pagination = {
      page: 1,
      limit: 12,
      total: 1,
      pages: 1,
      hasMore: false
    };
    const action = searchProducts.fulfilled({ products: searchResults, pagination });
    const newState = productSlice(initialState, action);
    expect(newState.searchLoading).toBe(false);
    expect(newState.searchResults).toEqual(searchResults);
    expect(newState.error).toBeNull();
  });
});
