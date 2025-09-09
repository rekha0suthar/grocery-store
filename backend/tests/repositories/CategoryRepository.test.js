import { CategoryRepository } from '../../src/repositories/CategoryRepository.js';
import { Category } from '@grocery-store/core/entities';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces';

describe('CategoryRepository - Data Access Layer', () => {
  let categoryRepository;
  let mockDatabaseAdapter;

  beforeEach(() => {
    // Create a mock that implements IDatabaseAdapter interface
    mockDatabaseAdapter = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findByField: jest.fn()
    };

    // Make it an instance of IDatabaseAdapter
    Object.setPrototypeOf(mockDatabaseAdapter, IDatabaseAdapter.prototype);

    categoryRepository = new CategoryRepository(mockDatabaseAdapter);
  });

  describe('Basic CRUD Operations', () => {
    test('finds category by ID successfully', async () => {
      const mockCategoryData = {
        id: 'cat1',
        name: 'Electronics',
        description: 'Electronic items',
        slug: 'electronics',
        parentId: null,
        isVisible: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findById.mockResolvedValue(mockCategoryData);

      const result = await categoryRepository.findById('cat1');

      expect(mockDatabaseAdapter.findById).toHaveBeenCalledWith('categories', 'cat1');
      expect(result).toBeInstanceOf(Category);
      expect(result.name).toBe('Electronics');
    });

    test('handles category not found by ID', async () => {
      mockDatabaseAdapter.findById.mockResolvedValue(null);

      const result = await categoryRepository.findById('nonexistent');

      expect(result).toBeNull();
    });

    test('creates category successfully', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic items',
        slug: 'electronics',
        parentId: null,
        isVisible: true,
        sortOrder: 1
      };

      const createdData = {
        id: 'cat1',
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.create.mockResolvedValue(createdData);

      const category = new Category(categoryData);
      const result = await categoryRepository.create(category);

      expect(mockDatabaseAdapter.create).toHaveBeenCalledWith('categories', category.toPersistence());
      expect(result).toBeInstanceOf(Category);
      expect(result.id).toBe('cat1');
    });

    test('updates category successfully', async () => {
      const updateData = { name: 'Updated Electronics' };
      const updatedData = {
        id: 'cat1',
        name: 'Updated Electronics',
        description: 'Electronic items',
        slug: 'electronics',
        parentId: null,
        isVisible: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.update.mockResolvedValue(updatedData);

      const result = await categoryRepository.update('cat1', updateData);

      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('categories', 'cat1', updateData);
      expect(result).toBeInstanceOf(Category);
      expect(result.name).toBe('Updated Electronics');
    });

    test('deletes category successfully', async () => {
      mockDatabaseAdapter.delete.mockResolvedValue(true);

      const result = await categoryRepository.delete('cat1');

      expect(mockDatabaseAdapter.delete).toHaveBeenCalledWith('categories', 'cat1');
      expect(result).toBe(true);
    });
  });

  describe('Category-Specific Methods', () => {
    test('finds category by slug', async () => {
      const mockCategoryData = {
        id: 'cat1',
        name: 'Electronics',
        slug: 'electronics',
        parentId: null,
        isVisible: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findByField.mockResolvedValue(mockCategoryData);

      const result = await categoryRepository.findBySlug('electronics');

      expect(mockDatabaseAdapter.findByField).toHaveBeenCalledWith('categories', 'slug', 'electronics');
      expect(result).toBeInstanceOf(Category);
      expect(result.slug).toBe('electronics');
    });

    test('finds root categories', async () => {
      const mockCategoriesData = [
        {
          id: 'cat1',
          name: 'Electronics',
          parentId: null,
          isVisible: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat2',
          name: 'Clothing',
          parentId: null,
          isVisible: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockCategoriesData);

      const result = await categoryRepository.findRootCategories();

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('categories', { parentId: null, isVisible: true }, 100, 0);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Category);
      expect(result[1]).toBeInstanceOf(Category);
    });

    test('finds categories by parent', async () => {
      const mockCategoriesData = [
        {
          id: 'cat2',
          name: 'Smartphones',
          parentId: 'cat1',
          isVisible: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockCategoriesData);

      const result = await categoryRepository.findByParent('cat1');

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('categories', { parentId: 'cat1', isVisible: true }, 100, 0);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Category);
      expect(result[0].parentId).toBe('cat1');
    });

    test('finds visible categories', async () => {
      const mockCategoriesData = [
        {
          id: 'cat1',
          name: 'Electronics',
          isVisible: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockCategoriesData);

      const result = await categoryRepository.findVisible();

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('categories', { isVisible: true }, 100, 0);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Category);
      expect(result[0].isVisible).toBe(true);
    });

    test('checks if category has products', async () => {
      mockDatabaseAdapter.count.mockResolvedValue(5);

      const result = await categoryRepository.hasProducts('cat1');

      expect(mockDatabaseAdapter.count).toHaveBeenCalledWith('products', { categoryId: 'cat1' });
      expect(result).toBe(true);
    });

    test('checks if category has subcategories', async () => {
      mockDatabaseAdapter.findAll.mockResolvedValue([{ id: 'sub1', parentId: 'cat1' }]);

      const result = await categoryRepository.hasSubcategories('cat1');

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('categories', { parentId: 'cat1' }, 1, 0);
      expect(result).toBe(true);
    });

    test('gets category tree', async () => {
      const mockCategoriesData = [
        {
          id: 'cat1',
          name: 'Electronics',
          parentId: null,
          isVisible: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat2',
          name: 'Smartphones',
          parentId: 'cat1',
          isVisible: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockCategoriesData);

      const result = await categoryRepository.getCategoryTree();

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith('categories', { isVisible: true }, 1000, 0);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Category);
      // expect(result[1]).toBeInstanceOf(Category);
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      mockDatabaseAdapter.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(categoryRepository.findById('cat1')).rejects.toThrow('Database connection failed');
    });

    test('handles creation errors', async () => {
      const category = new Category({ name: 'Test' });
      mockDatabaseAdapter.create.mockRejectedValue(new Error('Creation failed'));

      await expect(categoryRepository.create(category)).rejects.toThrow('Creation failed');
    });
  });

  describe('Adapter Integration', () => {
    test('uses provided database adapter', () => {
      expect(categoryRepository.databaseAdapter).toBe(mockDatabaseAdapter);
    });

    test('uses correct collection name', () => {
      expect(categoryRepository.collectionName).toBe('categories');
    });
  });
});
