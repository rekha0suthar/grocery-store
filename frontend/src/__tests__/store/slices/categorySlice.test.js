import categorySlice, { 
  fetchCategories, 
  fetchCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearError,
  clearCurrentCategory,
  setPagination
} from '../../../store/slices/categorySlice.js';

describe('categorySlice', () => {
  const initialState = {
    categories: [],
    categoryTree: [],
    currentCategory: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    loading: false,
    error: null,
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

  it('should handle clearCurrentCategory', () => {
    const stateWithCategory = { 
      ...initialState, 
      currentCategory: { id: '1', name: 'Electronics' } 
    };
    const action = clearCurrentCategory();
    const newState = categorySlice(stateWithCategory, action);
    expect(newState.currentCategory).toBeNull();
  });

  it('should handle setPagination', () => {
    const paginationData = { page: 2, total: 50 };
    const action = setPagination(paginationData);
    const newState = categorySlice(initialState, action);
    expect(newState.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 50,
      totalPages: 0,
    });
  });

  it('should handle fetchCategories.pending', () => {
    const action = fetchCategories.pending('requestId');
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchCategories.fulfilled', () => {
    const categories = [
      { id: '1', name: 'Electronics', description: 'Electronic items' },
      { id: '2', name: 'Clothing', description: 'Clothing items' }
    ];
    const pagination = { page: 1, total: 2, totalPages: 1 };
    const payload = { categories, pagination };
    const action = fetchCategories.fulfilled(payload, 'requestId');
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.categories).toEqual(categories);
    expect(newState.pagination).toEqual(pagination); // Direct assignment, not merge
  });

  it('should handle fetchCategories.rejected', () => {
    const errorMessage = 'Failed to fetch categories';
    // Create action with payload (not error.message)
    const action = {
      type: fetchCategories.rejected.type,
      payload: errorMessage
    };
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle fetchCategoryById.pending', () => {
    const action = fetchCategoryById.pending('requestId');
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle fetchCategoryById.fulfilled', () => {
    const category = { id: '1', name: 'Electronics', description: 'Electronic items' };
    const action = fetchCategoryById.fulfilled(category, 'requestId');
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.currentCategory).toEqual(category);
  });

  it('should handle fetchCategoryById.rejected', () => {
    const errorMessage = 'Failed to fetch category';
    // Create action with payload (not error.message)
    const action = {
      type: fetchCategoryById.rejected.type,
      payload: errorMessage
    };
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle createCategory.pending', () => {
    const action = createCategory.pending('requestId');
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it('should handle createCategory.fulfilled', () => {
    const newCategory = { id: '3', name: 'New Category', description: 'New category description' };
    const action = createCategory.fulfilled(newCategory, 'requestId');
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.categories).toContain(newCategory);
    expect(newState.categories[0]).toEqual(newCategory); // unshift adds to beginning
  });

  it('should handle createCategory.rejected', () => {
    const errorMessage = 'Failed to create category';
    // Create action with payload (not error.message)
    const action = {
      type: createCategory.rejected.type,
      payload: errorMessage
    };
    const newState = categorySlice(initialState, action);
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });

  it('should handle updateCategory.fulfilled', () => {
    const existingCategory = { id: '1', name: 'Electronics', description: 'Electronic items' };
    const updatedCategory = { id: '1', name: 'Updated Electronics', description: 'Updated electronic items' };
    const stateWithCategory = { ...initialState, categories: [existingCategory] };
    const action = updateCategory.fulfilled(updatedCategory, 'requestId');
    const newState = categorySlice(stateWithCategory, action);
    expect(newState.categories[0]).toEqual(updatedCategory);
  });

  it('should update currentCategory when updating the current category', () => {
    const existingCategory = { id: '1', name: 'Electronics', description: 'Electronic items' };
    const updatedCategory = { id: '1', name: 'Updated Electronics', description: 'Updated electronic items' };
    const stateWithCategory = { 
      ...initialState, 
      categories: [existingCategory],
      currentCategory: existingCategory
    };
    const action = updateCategory.fulfilled(updatedCategory, 'requestId');
    const newState = categorySlice(stateWithCategory, action);
    expect(newState.currentCategory).toEqual(updatedCategory);
  });

  it('should handle deleteCategory.fulfilled', () => {
    const categoryToDelete = { id: '1', name: 'Electronics', description: 'Electronic items' };
    const stateWithCategory = { ...initialState, categories: [categoryToDelete] };
    const action = deleteCategory.fulfilled('1', 'requestId');
    const newState = categorySlice(stateWithCategory, action);
    expect(newState.categories).not.toContain(categoryToDelete);
    expect(newState.categories).toHaveLength(0);
  });

  it('should clear currentCategory when deleting the current category', () => {
    const categoryToDelete = { id: '1', name: 'Electronics', description: 'Electronic items' };
    const stateWithCategory = { 
      ...initialState, 
      categories: [categoryToDelete],
      currentCategory: categoryToDelete
    };
    const action = deleteCategory.fulfilled('1', 'requestId');
    const newState = categorySlice(stateWithCategory, action);
    expect(newState.currentCategory).toBeNull();
  });
});
