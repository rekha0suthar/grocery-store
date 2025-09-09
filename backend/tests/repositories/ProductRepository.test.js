import { ProductRepository } from '../../src/repositories/ProductRepository.js';
import { Product } from '@grocery-store/core/entities';
import { IDatabaseAdapter } from '@grocery-store/core/interfaces';

describe('ProductRepository - Data Access Layer', () => {
  let productRepository;
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

    productRepository = new ProductRepository(mockDatabaseAdapter);
  });

  describe('Basic CRUD Operations', () => {
    test('finds product by ID successfully', async () => {
      const mockProductData = {
        id: 'prod1',
        name: 'iPhone 15',
        description: 'Latest iPhone',
        price: 999.99,
        sku: 'IPH15-001',
        stock: 50,
        minStock: 10,
        categoryId: 'cat1',
        isVisible: true,
        isFeatured: false,
        addedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findById.mockResolvedValue(mockProductData);

      const result = await productRepository.findById('prod1');

      expect(mockDatabaseAdapter.findById).toHaveBeenCalledWith('products', 'prod1');
      expect(result).toBeInstanceOf(Product);
      expect(result.name).toBe('iPhone 15');
    });

    test('creates product successfully', async () => {
      const productData = {
        name: 'iPhone 15',
        description: 'Latest iPhone',
        price: 999.99,
        sku: 'IPH15-001',
        stock: 50,
        minStock: 10,
        categoryId: 'cat1',
        isVisible: true,
        isFeatured: false,
        addedBy: 'user1'
      };

      const createdData = {
        id: 'prod1',
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.create.mockResolvedValue(createdData);

      const product = new Product(productData);
      const result = await productRepository.create(product);

      expect(mockDatabaseAdapter.create).toHaveBeenCalledWith('products', product.toPersistence());
      expect(result).toBeInstanceOf(Product);
      expect(result.id).toBe('prod1');
    });

    test('updates product successfully', async () => {
      const updateData = { price: 899.99 };
      const updatedData = {
        id: 'prod1',
        name: 'iPhone 15',
        price: 899.99,
        sku: 'IPH15-001',
        stock: 50,
        minStock: 10,
        categoryId: 'cat1',
        isVisible: true,
        isFeatured: false,
        addedBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.update.mockResolvedValue(updatedData);

      const result = await productRepository.update('prod1', updateData);

      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('products', 'prod1', updateData);
      expect(result).toBeInstanceOf(Product);
      expect(result.price).toBe(899.99);
    });
  });

  describe('Product-Specific Methods', () => {
    test('finds products by category', async () => {
      const mockProductsData = [
        {
          id: 'prod1',
          name: 'iPhone 15',
          categoryId: 'cat1',
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockProductsData);

      const result = await productRepository.findByCategory('cat1', 20, 0);

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith(
        'products',
        { categoryId: 'cat1', isVisible: true },
        20,
        0
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Product);
    });

    test('finds featured products', async () => {
      const mockProductsData = [
        {
          id: 'prod1',
          name: 'Featured Product',
          isFeatured: true,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockProductsData);

      const result = await productRepository.findFeatured(10);

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith(
        'products',
        { isFeatured: true, isVisible: true },
        10,
        0
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Product);
    });

    test('finds in-stock products', async () => {
      const mockProductsData = [
        {
          id: 'prod1',
          name: 'In Stock Product',
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockProductsData);

      const result = await productRepository.findInStock(50, 0);

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith(
        'products',
        { isVisible: true },
        50,
        0
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Product);
    });

    test('finds low stock products', async () => {
      const mockProductsData = [
        {
          id: 'prod1',
          name: 'Low Stock Product',
          stock: 5,
          minStock: 10,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'prod2',
          name: 'Normal Stock Product',
          stock: 50,
          minStock: 10,
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockProductsData);

      const result = await productRepository.findLowStock();

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith(
        'products',
        { isVisible: true },
        1000,
        0
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Low Stock Product');
    });

    test('searches products by term', async () => {
      const mockProductsData = [
        {
          id: 'prod1',
          name: 'iPhone 15',
          description: 'Latest smartphone',
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'prod2',
          name: 'Samsung Galaxy',
          description: 'Android phone',
          isVisible: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockDatabaseAdapter.findAll.mockResolvedValue(mockProductsData);

      const result = await productRepository.searchProducts('iPhone', 10, 0);

      expect(mockDatabaseAdapter.findAll).toHaveBeenCalledWith(
        'products',
        { isVisible: true },
        1000,
        0
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('iPhone 15');
    });

    test('finds product by SKU', async () => {
      const mockProductData = {
        id: 'prod1',
        name: 'iPhone 15',
        sku: 'IPH15-001',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findByField.mockResolvedValue(mockProductData);

      const result = await productRepository.findBySku('IPH15-001');

      expect(mockDatabaseAdapter.findByField).toHaveBeenCalledWith('products', 'sku', 'IPH15-001');
      expect(result).toBeInstanceOf(Product);
      expect(result.sku).toBe('IPH15-001');
    });

    test('updates product stock', async () => {
      const updatedData = {
        id: 'prod1',
        name: 'iPhone 15',
        stock: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.update.mockResolvedValue(updatedData);

      const result = await productRepository.updateStock('prod1', 75);

      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('products', 'prod1', { stock: 75 });
      expect(result).toBeInstanceOf(Product);
      expect(result.stock).toBe(75);
    });

    test('reduces product stock', async () => {
      const mockProductData = {
        id: 'prod1',
        name: 'iPhone 15',
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedData = {
        ...mockProductData,
        stock: 30
      };

      mockDatabaseAdapter.findById.mockResolvedValue(mockProductData);
      mockDatabaseAdapter.update.mockResolvedValue(updatedData);

      const result = await productRepository.reduceStock('prod1', 20);

      expect(mockDatabaseAdapter.findById).toHaveBeenCalledWith('products', 'prod1');
      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('products', 'prod1', { stock: 30 });
      expect(result).toBeInstanceOf(Product);
      expect(result.stock).toBe(30);
    });

    test('adds product stock', async () => {
      const mockProductData = {
        id: 'prod1',
        name: 'iPhone 15',
        stock: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedData = {
        ...mockProductData,
        stock: 70
      };

      mockDatabaseAdapter.findById.mockResolvedValue(mockProductData);
      mockDatabaseAdapter.update.mockResolvedValue(updatedData);

      const result = await productRepository.addStock('prod1', 20);

      expect(mockDatabaseAdapter.findById).toHaveBeenCalledWith('products', 'prod1');
      expect(mockDatabaseAdapter.update).toHaveBeenCalledWith('products', 'prod1', { stock: 70 });
      expect(result).toBeInstanceOf(Product);
      expect(result.stock).toBe(70);
    });

    test('handles insufficient stock for reduction', async () => {
      const mockProductData = {
        id: 'prod1',
        name: 'iPhone 15',
        stock: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockDatabaseAdapter.findById.mockResolvedValue(mockProductData);

      const result = await productRepository.reduceStock('prod1', 20);

      expect(result).toBeNull();
    });

    test('handles product not found for stock operations', async () => {
      mockDatabaseAdapter.findById.mockResolvedValue(null);

      const result = await productRepository.addStock('nonexistent', 20);

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      mockDatabaseAdapter.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(productRepository.findById('prod1')).rejects.toThrow('Database connection failed');
    });

    test('handles creation errors', async () => {
      const product = new Product({ name: 'Test Product' });
      mockDatabaseAdapter.create.mockRejectedValue(new Error('Creation failed'));

      await expect(productRepository.create(product)).rejects.toThrow('Creation failed');
    });
  });

  describe('Adapter Integration', () => {
    test('uses provided database adapter', () => {
      expect(productRepository.databaseAdapter).toBe(mockDatabaseAdapter);
    });

    test('uses correct collection name', () => {
      expect(productRepository.collectionName).toBe('products');
    });
  });
});
