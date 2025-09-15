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
    error: null,
    pagination: {}
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
    const stateWithProducts = { ...initialState, products: [{ id: '1' }] };
    const action = clearProducts();
    const newState = productSlice(stateWithProducts, action);
    expect(newState.products).toEqual([]);
    expect(newState.searchResults).toEqual([]);
  });

  it('should handle clearCurrentProduct', () => {
    const stateWithProduct = { ...initialState, currentProduct: { id: '1' } };
    const action = clearCurrentProduct();
    const newState = productSlice(stateWithProduct, action);
    expect(newState.currentProduct).toBeNull();
  });

  it('should handle fetchProducts.pending', () => {
    const action = fetchProducts.pending('requestId');
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchProducts.fulfilled', () => {
    const products = [
      { id: '1', name: 'Product 1', price: 10.99 },
      { id: '2', name: 'Product 2', price: 15.99 }
    ];
    const pagination = { page: 1, limit: 12 };
    const action = fetchProducts.fulfilled({ products, pagination }, 'requestId');
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.products).toEqual(products);
    expect(newState.pagination).toEqual(pagination);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchProducts.rejected', () => {
    const error = 'Failed to fetch products';
    const action = fetchProducts.rejected(null, 'requestId', null, error);
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(error);
  });

  it('should handle fetchProductById.pending', () => {
    const action = fetchProductById.pending('requestId');
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchProductById.fulfilled', () => {
    const product = { id: '1', name: 'Product 1', price: 10.99 };
    const action = fetchProductById.fulfilled(product, 'requestId');
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.currentProduct).toEqual(product);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchProductById.rejected', () => {
    const error = 'Failed to fetch product';
    const action = fetchProductById.rejected(null, 'requestId', null, error);
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(error);
  });

  it('should handle createProduct.fulfilled', () => {
    const newProduct = { id: '3', name: 'New Product', price: 20.99 };
    const stateWithProducts = { ...initialState, products: [{ id: '1' }] };
    const action = createProduct.fulfilled(newProduct, 'requestId');
    const newState = productSlice(stateWithProducts, action);
    expect(newState.loading).toBe(false);
    expect(newState.products).toContain(newProduct);
    expect(newState.error).toBeNull();
  });

  it('should handle updateProduct.fulfilled', () => {
    const existingProduct = { id: '1', name: 'Product 1', price: 10.99 };
    const updatedProduct = { id: '1', name: 'Updated Product', price: 12.99 };
    const stateWithProduct = { ...initialState, products: [existingProduct], currentProduct: existingProduct };
    const action = updateProduct.fulfilled(updatedProduct, 'requestId');
    const newState = productSlice(stateWithProduct, action);
    expect(newState.loading).toBe(false);
    expect(newState.products[0]).toEqual(updatedProduct);
    expect(newState.currentProduct).toEqual(updatedProduct);
    expect(newState.error).toBeNull();
  });

  it('should handle deleteProduct.fulfilled', () => {
    const productToDelete = { id: '1', name: 'Product 1', price: 10.99 };
    const stateWithProduct = { ...initialState, products: [productToDelete] };
    const action = deleteProduct.fulfilled('1', 'requestId');
    const newState = productSlice(stateWithProduct, action);
    expect(newState.loading).toBe(false);
    expect(newState.products).not.toContain(productToDelete);
    expect(newState.currentProduct).toBeNull();
    expect(newState.error).toBeNull();
  });

  it('should handle searchProducts.fulfilled', () => {
    const searchResults = [
      { id: '1', name: 'Search Result 1', price: 10.99 }
    ];
    const action = searchProducts.fulfilled({ products: searchResults }, 'requestId');
    const newState = productSlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.searchResults).toEqual(searchResults);
    expect(newState.error).toBeNull();
  });
});
