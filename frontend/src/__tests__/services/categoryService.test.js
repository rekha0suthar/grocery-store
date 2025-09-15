import { categoryService } from '../../services/categoryService.js';
import api from '../../services/api.js';

// Mock the api module
jest.mock('../../services/api.js');

describe('categoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Fruits', description: 'Fresh fruits' },
        { id: '2', name: 'Vegetables', description: 'Fresh vegetables' }
      ];

      api.get.mockResolvedValue({ data: mockCategories });

      const result = await categoryService.getCategories();

      expect(api.get).toHaveBeenCalledWith('/categories', { params: {} });
      expect(result).toEqual({ data: mockCategories });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      api.get.mockRejectedValue(error);

      await expect(categoryService.getCategories()).rejects.toThrow('API Error');
    });
  });

  describe('getCategoryById', () => {
    it('should fetch a category by ID', async () => {
      const mockCategory = { id: '1', name: 'Fruits', description: 'Fresh fruits' };

      api.get.mockResolvedValue({ data: mockCategory });

      const result = await categoryService.getCategoryById('1');

      expect(api.get).toHaveBeenCalledWith('/categories/1');
      expect(result).toEqual({ data: mockCategory });
    });

    it('should handle API errors', async () => {
      const error = new Error('Category not found');
      api.get.mockRejectedValue(error);

      await expect(categoryService.getCategoryById('1')).rejects.toThrow('Category not found');
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const newCategory = { name: 'Dairy', description: 'Dairy products' };
      const createdCategory = { id: '3', ...newCategory };

      api.post.mockResolvedValue({ data: createdCategory });

      const result = await categoryService.createCategory(newCategory);

      expect(api.post).toHaveBeenCalledWith('/categories', newCategory);
      expect(result).toEqual({ data: createdCategory });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to create category');
      api.post.mockRejectedValue(error);

      await expect(categoryService.createCategory({})).rejects.toThrow('Failed to create category');
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const categoryId = '1';
      const updatedCategory = { name: 'Fresh Fruits', description: 'Updated description' };
      const resultCategory = { id: categoryId, ...updatedCategory };

      api.put.mockResolvedValue({ data: resultCategory });

      const result = await categoryService.updateCategory(categoryId, updatedCategory);

      expect(api.put).toHaveBeenCalledWith(`/categories/${categoryId}`, updatedCategory);
      expect(result).toEqual({ data: resultCategory });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to update category');
      api.put.mockRejectedValue(error);

      await expect(categoryService.updateCategory('1', {})).rejects.toThrow('Failed to update category');
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      api.delete.mockResolvedValue({ data: { success: true } });

      const result = await categoryService.deleteCategory('1');

      expect(api.delete).toHaveBeenCalledWith('/categories/1');
      expect(result).toEqual({ data: { success: true } });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to delete category');
      api.delete.mockRejectedValue(error);

      await expect(categoryService.deleteCategory('1')).rejects.toThrow('Failed to delete category');
    });
  });

  describe('getCategoryTree', () => {
    it('should fetch category tree', async () => {
      const mockTree = [
        {
          id: '1',
          name: 'Fruits',
          children: [
            { id: '2', name: 'Apples', children: [] }
          ]
        }
      ];

      api.get.mockResolvedValue({ data: mockTree });

      const result = await categoryService.getCategoryTree();

      expect(api.get).toHaveBeenCalledWith('/categories/tree');
      expect(result).toEqual({ data: mockTree });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch category tree');
      api.get.mockRejectedValue(error);

      await expect(categoryService.getCategoryTree()).rejects.toThrow('Failed to fetch category tree');
    });
  });
});
