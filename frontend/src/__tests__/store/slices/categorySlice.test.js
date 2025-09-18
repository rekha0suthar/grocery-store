import categorySlice, { 
  fetchCategories, 
  fetchCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  fetchCategoryTree,
  clearCategories,
  clearError,
  resetPagination
} from '../../../store/slices/categorySlice.js';

describe('categorySlice', () => {
  const initialState = {
    categories: [],
    categoryTree: [],
    loading: false,
    loadingMore: false,
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
    expect(categorySlice(undefined, {})).toEqual(initialState);
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const action = clearError();
    const newState = categorySlice(stateWithError, action);
    expect(newState.error).toBeNull();
  });

  it('should handle clearCategories', () => {
    const stateWithCategories = { 
      ...initialState, 
      categories: [{ id: '1', name: 'Electronics' }],
      categoryTree: [{ id: '1', name: 'Electronics', children: [] }]
    };
    const action = clearCategories();
    const newState = categorySlice(stateWithCategories, action);
    expect(newState.categories).toEqual([]);
    expect(newState.categoryTree).toEqual([]);
    expect(newState.pagination).toEqual({
      page: 1,
      limit: 5,
      total: 0,
      pages: 0,
      hasMore: false
    });
  });

  it('should handle resetPagination', () => {
    const stateWithPagination = { 
      ...initialState, 
      pagination: { page: 3, limit: 5, total: 50, pages: 5, hasMore: true }
    };
    const action = resetPagination();
    const newState = categorySlice(stateWithPagination, action);
    expect(newState.pagination).toEqual({
      page: 1,
      limit: 5,
      total: 0,
      pages: 0,
      hasMore: false
    });
  });

  it('should handle fetchCategories.fulfilled', () => {
    const categories = [
      { id: '1', name: 'Electronics', description: 'Electronic items' },
      { id: '2', name: 'Clothing', description: 'Clothing items' }
    ];
    const pagination = {
      page: 1,
      total: 2,
      totalPages: 1,
      hasMore: false
    };
    const action = fetchCategories.fulfilled({ categories, pagination, isInitialLoad: true });
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.categories).toEqual(categories);
    expect(newState.pagination).toEqual({
      ...pagination,
      hasMore: pagination.page < pagination.pages
    });
  });

  it('should handle fetchCategories.rejected', () => {
    const error = 'Failed to fetch categories';
    const action = fetchCategories.rejected(new Error(error), 'requestId', {}, error);
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(error);
  });

  it('should handle fetchCategoryById.fulfilled', () => {
    const category = { id: '1', name: 'Electronics', description: 'Electronic items' };
    const action = fetchCategoryById.fulfilled(category, 'requestId', '1');
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBeNull();
  });

  it('should handle createCategory.fulfilled', () => {
    const newCategory = { id: '3', name: 'Books', description: 'Book items' };
    const action = createCategory.fulfilled(newCategory, 'requestId', {});
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.categories).toContain(newCategory);
    expect(newState.error).toBeNull();
  });

  it('should handle updateCategory.fulfilled', () => {
    const stateWithCategory = {
      ...initialState,
      categories: [{ id: '1', name: 'Electronics', description: 'Electronic items' }]
    };
    const updatedCategory = { id: '1', name: 'Updated Electronics', description: 'Updated electronic items' };
    const action = updateCategory.fulfilled(updatedCategory, 'requestId', { id: '1', categoryData: {} });
    const newState = categorySlice(stateWithCategory, action);
    expect(newState.loading).toBe(false);
    expect(newState.categories[0]).toEqual(updatedCategory);
    expect(newState.error).toBeNull();
  });

  it('should handle deleteCategory.fulfilled', () => {
    const stateWithCategory = {
      ...initialState,
      categories: [{ id: '1', name: 'Electronics', description: 'Electronic items' }]
    };
    const action = deleteCategory.fulfilled('1', 'requestId', '1');
    const newState = categorySlice(stateWithCategory, action);
    expect(newState.loading).toBe(false);
    expect(newState.categories).toEqual([]);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchCategoryTree.fulfilled', () => {
    const categoryTree = [
      { id: '1', name: 'Electronics', children: [] }
    ];
    const action = fetchCategoryTree.fulfilled({ categories: categoryTree });
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.categoryTree).toEqual(categoryTree);
    expect(newState.error).toBeNull();
  });
});
