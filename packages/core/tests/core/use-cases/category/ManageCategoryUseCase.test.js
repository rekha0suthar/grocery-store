import { ManageCategoryUseCase } from '../../../../use-cases/category/ManageCategoryUseCase';
import { Category } from '../../../../entities/Category';

describe('ManageCategoryUseCase - Application Policy', () => {
  let useCase;
  let mockCategoryRepository;

  beforeEach(() => {
    mockCategoryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findBySlug: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    };
    
    useCase = new ManageCategoryUseCase({ categoryRepo: mockCategoryRepository });
  });

  describe('Authorization', () => {
    test('rejects when user is not authorized to manage categories', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'A test category'
      };

      const result = await useCase.createCategory(categoryData, 'customer', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to manage categories');
      expect(result.category).toBeNull();
    });

    test('allows admin to manage categories', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'A test category'
      };

      const createdCategoryData = {
        id: 'cat1',
        ...categoryData,
        slug: 'test-category',
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(createdCategoryData);

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category created successfully');
      expect(result.category).toBeInstanceOf(Category);
    });

    test('allows store manager to manage categories', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'A test category'
      };

      const createdCategoryData = {
        id: 'cat1',
        ...categoryData,
        slug: 'test-category',
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(createdCategoryData);

      const result = await useCase.createCategory(categoryData, 'store_manager', 'manager1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category created successfully');
      expect(result.category).toBeInstanceOf(Category);
    });
  });

  describe('Create Category', () => {
    test('rejects missing category data', async () => {
      const result = await useCase.createCategory(null, 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category data is required');
      expect(result.category).toBeNull();
    });

    test('rejects missing category name', async () => {
      const categoryData = {
        description: 'A test category'
      };

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category name is required');
      expect(result.category).toBeNull();
    });

    test('rejects when category name already exists', async () => {
      const categoryData = {
        name: 'Existing Category',
        description: 'A test category'
      };

      const existingCategory = new Category({
        id: 'cat1',
        name: 'Existing Category',
        slug: 'existing-category'
      });

      mockCategoryRepository.findByName.mockResolvedValue(existingCategory);

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category with this name already exists');
      expect(result.category).toBeNull();
      expect(mockCategoryRepository.findByName).toHaveBeenCalledWith('Existing Category');
    });

    test('creates category successfully with valid data', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'A test category',
        parentId: 'parent1',
        isVisible: true,
        sortOrder: 5
      };

      const createdCategoryData = {
        id: 'cat1',
        ...categoryData,
        slug: 'test-category',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(createdCategoryData);

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category created successfully');
      expect(result.category).toBeInstanceOf(Category);
      expect(result.category.name).toBe('Test Category');
      expect(result.category.description).toBe('A test category');
      expect(result.category.parentId).toBe('parent1');
      expect(result.category.isVisible).toBe(true);
      expect(result.category.sortOrder).toBe(5);
      expect(result.category.slug).toBe('test-category');

      expect(mockCategoryRepository.create).toHaveBeenCalled();
    });

    test('creates category with default values', async () => {
      const categoryData = {
        name: 'Test Category'
      };

      const createdCategoryData = {
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category',
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(createdCategoryData);

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.category.isVisible).toBe(true);
      expect(result.category.sortOrder).toBe(0);
    });
  });

  describe('Update Category', () => {
    test('rejects when category not found', async () => {
      const updateData = {
        name: 'Updated Category'
      };

      mockCategoryRepository.findById.mockResolvedValue(null);

      const result = await useCase.updateCategory('nonexistent', updateData, 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category not found');
      expect(result.category).toBeNull();
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('nonexistent');
    });

    test('rejects when new name conflicts with existing category', async () => {
      const existingCategory = new Category({
        id: 'cat1',
        name: 'Original Category',
        slug: 'original-category'
      });

      const conflictingCategory = new Category({
        id: 'cat2',
        name: 'Conflicting Category',
        slug: 'conflicting-category'
      });

      const updateData = {
        name: 'Conflicting Category'
      };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.findByName.mockResolvedValue(conflictingCategory);

      const result = await useCase.updateCategory('cat1', updateData, 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category with this name already exists');
      expect(result.category).toBeNull();
    });

    test('updates category successfully', async () => {
      const existingCategory = new Category({
        id: 'cat1',
        name: 'Original Category',
        slug: 'original-category',
        description: 'Original description',
        isVisible: true,
        sortOrder: 0
      });

      const updateData = {
        name: 'Updated Category',
        description: 'Updated description',
        isVisible: false,
        sortOrder: 5
      };

      const updatedCategoryData = {
        id: 'cat1',
        ...updateData,
        slug: 'updated-category',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findById.mockResolvedValue(existingCategory);
      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.update.mockResolvedValue(updatedCategoryData);

      const result = await useCase.updateCategory('cat1', updateData, 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category updated successfully');
      expect(result.category).toBeInstanceOf(Category);
      expect(result.category.name).toBe('Updated Category');
      expect(result.category.description).toBe('Updated description');
      expect(result.category.isVisible).toBe(false);
      expect(result.category.sortOrder).toBe(5);
      expect(result.category.slug).toBe('updated-category');

      expect(mockCategoryRepository.update).toHaveBeenCalled();
    });
  });

  describe('Delete Category', () => {
    test('rejects when category not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      const result = await useCase.deleteCategory('nonexistent', 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category not found');
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('nonexistent');
    });

    test('deletes category successfully', async () => {
      const category = new Category({
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category'
      });

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.delete.mockResolvedValue(true);

      const result = await useCase.deleteCategory('cat1', 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category deleted successfully');
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('cat1');
    });
  });

  describe('Get Categories', () => {
    test('retrieves all categories successfully', async () => {
      const categoriesData = [
        {
          id: 'cat1',
          name: 'Category 1',
          slug: 'category-1',
          isVisible: true,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat2',
          name: 'Category 2',
          slug: 'category-2',
          isVisible: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockCategoryRepository.findAll.mockResolvedValue(categoriesData);

      const result = await useCase.getAllCategories();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Categories retrieved successfully');
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0]).toBeInstanceOf(Category);
      expect(result.categories[1]).toBeInstanceOf(Category);
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
    });

    test('retrieves category by ID successfully', async () => {
      const categoryData = {
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category',
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findById.mockResolvedValue(categoryData);

      const result = await useCase.getCategoryById('cat1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Category retrieved successfully');
      expect(result.category).toBeInstanceOf(Category);
      expect(result.category.id).toBe('cat1');
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('cat1');
    });

    test('handles category not found in get by ID', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      const result = await useCase.getCategoryById('nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category not found');
      expect(result.category).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully in create', async () => {
      mockCategoryRepository.findByName.mockRejectedValue(new Error('Database connection failed'));

      const categoryData = {
        name: 'Test Category',
        description: 'A test category'
      };

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create category');
      expect(result.category).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });

    test('handles repository errors gracefully in update', async () => {
      const category = new Category({
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category'
      });

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.update.mockRejectedValue(new Error('Failed to update category'));

      const updateData = {
        name: 'Updated Category'
      };

      const result = await useCase.updateCategory('cat1', updateData, 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update category');
      expect(result.category).toBeNull();
      expect(result.error).toBe('Failed to update category');
    });

    test('handles repository errors gracefully in delete', async () => {
      const category = new Category({
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category'
      });

      mockCategoryRepository.findById.mockResolvedValue(category);
      mockCategoryRepository.delete.mockRejectedValue(new Error('Failed to delete category'));

      const result = await useCase.deleteCategory('cat1', 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete category');
      expect(result.error).toBe('Failed to delete category');
    });
  });

  describe('Business Rules Integration', () => {
    test('creates valid category entity', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'A test category'
      };

      const createdCategoryData = {
        id: 'cat1',
        ...categoryData,
        slug: 'test-category',
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(createdCategoryData);

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.category).toBeInstanceOf(Category);
      expect(result.category.isValid()).toBe(true);
      expect(result.category.validateName()).toBe(true);
      expect(result.category.validateSlug()).toBe(true);
    });

    test('uses category entity slug generation', async () => {
      const categoryData = {
        name: 'Test Category With Special Characters!',
        description: 'A test category'
      };

      const createdCategoryData = {
        id: 'cat1',
        name: 'Test Category With Special Characters!',
        description: 'A test category',
        slug: 'test-category-with-special-characters',
        isVisible: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockCategoryRepository.findByName.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(createdCategoryData);

      const result = await useCase.createCategory(categoryData, 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.category.slug).toBe('test-category-with-special-characters');
    });
  });
});
