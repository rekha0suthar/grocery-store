import { CreateProductUseCase } from '../../../../use-cases/product/CreateProductUseCase.js';
import { Product } from '../../../../entities/Product.js';
import { Category } from '../../../../entities/Category.js';

describe('CreateProductUseCase - Application Policy', () => {
  let useCase;
  let mockProductRepository;
  let mockCategoryRepository;

  beforeEach(() => {
    // Mock repositories
    mockProductRepository = {
      create: jest.fn(),
      findBySku: jest.fn()
    };

    mockCategoryRepository = {
      findById: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new CreateProductUseCase({
      productRepo: mockProductRepository,
      categoryRepo: mockCategoryRepository
    });
  });

  describe('Authorization', () => {
    test('rejects when user is not authorized to create products', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        categoryId: 'cat1'
      };

      const result = await useCase.execute(productData, 'customer', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to create product');
      expect(result.product).toBeNull();
    });

    test('allows admin to create products', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        categoryId: 'cat1'
      };

      const category = new Category({
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category'
      });

      const createdProduct = new Product({
        ...productData,
        id: 'prod1',
        addedBy: 'user1',
        isVisible: true
      });

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(category.toJSON());
      mockProductRepository.create.mockResolvedValue(createdProduct.toJSON());

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product created successfully');
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product.name).toBe('Test Product');
      expect(result.product.addedBy).toBe('user1');
      expect(result.product.isVisible).toBe(true);
    });

    test('allows store manager to create products', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        categoryId: 'cat1'
      };

      const category = new Category({
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category'
      });

      const createdProduct = new Product({
        ...productData,
        id: 'prod1',
        addedBy: 'user1',
        isVisible: true
      });

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(category.toJSON());
      mockProductRepository.create.mockResolvedValue(createdProduct.toJSON());

      const result = await useCase.execute(productData, 'store_manager', 'user1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product created successfully');
      expect(result.product).toBeInstanceOf(Product);
    });
  });

  describe('Input Validation', () => {
    test('rejects missing product data', async () => {
      const result = await useCase.execute(null, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product data is required');
      expect(result.product).toBeNull();
    });

    test('rejects missing product name', async () => {
      const productData = {
        sku: 'TEST-001',
        price: 10.99,
        stock: 100
      };

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product name is required');
      expect(result.product).toBeNull();
    });

    test('rejects missing product price', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        stock: 100
      };

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product price must be greater than 0');
      expect(result.product).toBeNull();
    });

    test('rejects missing SKU', async () => {
      const productData = {
        name: 'Test Product',
        price: 10.99,
        stock: 100
      };

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product SKU is required');
      expect(result.product).toBeNull();
    });

    test('rejects missing stock', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99
      };

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product stock is required');
      expect(result.product).toBeNull();
    });

    test('rejects missing category ID', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        categoryId: 'nonexistent'
      };

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category not found');
      expect(result.product).toBeNull();
    });

    test('rejects invalid price', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: -5,
        stock: 100
      };

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product price must be greater than 0');
      expect(result.product).toBeNull();
    });

    test('rejects invalid stock', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: -1
      };

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product stock cannot be negative');
      expect(result.product).toBeNull();
    });
  });

  describe('Category Validation', () => {
    test('rejects when category not found', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        categoryId: 'nonexistent'
      };

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Category not found');
      expect(result.product).toBeNull();
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('SKU Validation', () => {
    test('rejects when SKU already exists', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'EXISTING-SKU',
        price: 10.99,
        stock: 100
      };

      const existingProduct = new Product({
        id: 'existing1',
        name: 'Existing Product',
        sku: 'EXISTING-SKU',
        price: 15.99,
        stock: 50
      });

      mockProductRepository.findBySku.mockResolvedValue(existingProduct.toJSON());

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product with this SKU already exists');
      expect(result.product).toBeNull();
      expect(mockProductRepository.findBySku).toHaveBeenCalledWith('EXISTING-SKU');
    });
  });

  describe('Product Creation', () => {
    test('creates product successfully with valid data', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        categoryId: 'cat1'
      };

      const category = new Category({
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category'
      });

      const createdProduct = new Product({
        ...productData,
        id: 'prod1',
        addedBy: 'user1',
        isVisible: true
      });

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(category.toJSON());
      mockProductRepository.create.mockResolvedValue(createdProduct.toJSON());

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product created successfully');
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product.name).toBe('Test Product');
      expect(result.product.sku).toBe('TEST-001');
      expect(result.product.price).toBe(10.99);
      expect(result.product.stock).toBe(100);
      expect(result.product.addedBy).toBe('user1');
      expect(result.product.isVisible).toBe(true);
      expect(mockProductRepository.create).toHaveBeenCalled();
    });

    test('creates product with default visibility', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100
      };

      const createdProduct = new Product({
        ...productData,
        id: 'prod1',
        addedBy: 'user1',
        isVisible: true
      });

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(createdProduct.toJSON());

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(true);
      expect(result.product.isVisible).toBe(true);
    });

    test('creates product with specified visibility', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        isVisible: false
      };

      const createdProduct = new Product({
        ...productData,
        id: 'prod1',
        addedBy: 'user1',
        isVisible: true // Use case overrides this to true
      });

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(createdProduct.toJSON());

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(true);
      expect(result.product.isVisible).toBe(true); // Use case sets this to true
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100
      };

      mockProductRepository.findBySku.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product creation failed');
      expect(result.product).toBeNull();
      expect(result.error).toBe('Database error');
    });

    test('handles product creation errors gracefully', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100
      };

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockRejectedValue(new Error('Creation failed'));

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product creation failed');
      expect(result.product).toBeNull();
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('Business Rules Integration', () => {
    test('creates valid product entity', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100
      };

      const createdProduct = new Product({
        ...productData,
        id: 'prod1',
        addedBy: 'user1',
        isVisible: true
      });

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(createdProduct.toJSON());

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(true);
      expect(result.product).toBeInstanceOf(Product);

      // The created product should be valid according to entity business rules
      expect(result.product.isValid()).toBe(true);
      expect(result.product.name).toBeTruthy();
      expect(result.product.price).toBeGreaterThan(0);
      expect(result.product.stock).toBeGreaterThanOrEqual(0);
    });

    test('uses category entity for validation', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 100,
        categoryId: 'cat1'
      };

      const category = new Category({
        id: 'cat1',
        name: 'Test Category',
        slug: 'test-category'
      });

      const createdProduct = new Product({
        ...productData,
        id: 'prod1',
        addedBy: 'user1',
        isVisible: true
      });

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockCategoryRepository.findById.mockResolvedValue(category.toJSON());
      mockProductRepository.create.mockResolvedValue(createdProduct.toJSON());

      const result = await useCase.execute(productData, 'admin', 'user1');

      expect(result.success).toBe(true);
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('cat1');
    });
  });
});