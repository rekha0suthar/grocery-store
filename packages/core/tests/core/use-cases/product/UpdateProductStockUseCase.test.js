import { UpdateProductStockUseCase } from '../../../../use-cases/product/UpdateProductStockUseCase.js';
import { Product } from '../../../../entities/Product.js';

describe('UpdateProductStockUseCase - Application Policy', () => {
  let useCase;
  let mockProductRepository;

  beforeEach(() => {
    // Mock repository
    mockProductRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new UpdateProductStockUseCase({
      productRepo: mockProductRepository
    });
  });

  describe('Input Validation', () => {
    test('rejects missing product ID', async () => {
      const result = await useCase.execute(null, 5, 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product ID is required');
      expect(result.product).toBeNull();
    });

    test('rejects missing stock value', async () => {
      const result = await useCase.execute('prod1', null, 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Stock change must be a number');
      expect(result.product).toBeNull();
    });

    test('rejects negative stock value', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 2
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());

      const result = await useCase.execute('prod1', -5, 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient stock for this operation');
      expect(result.product).toBeNull();
    });
  });

  describe('Authorization', () => {
    test('rejects when user is not authorized to update stock', async () => {
      const result = await useCase.execute('prod1', 5, 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to update stock');
      expect(result.product).toBeNull();
    });

    test('allows admin to update stock', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 10
      });

      const updatedProduct = new Product({
        ...product.toJSON(),
        stock: 15
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockProductRepository.update.mockResolvedValue(updatedProduct.toJSON());

      const result = await useCase.execute('prod1', 5, 'admin');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stock updated successfully');
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product.stock).toBe(15);
    });

    test('allows store manager to update stock', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 10
      });

      const updatedProduct = new Product({
        ...product.toJSON(),
        stock: 8
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockProductRepository.update.mockResolvedValue(updatedProduct.toJSON());

      const result = await useCase.execute('prod1', -2, 'store_manager');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stock updated successfully');
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product.stock).toBe(8);
    });
  });

  describe('Product Lookup', () => {
    test('rejects when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('nonexistent', 5, 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
      expect(result.product).toBeNull();
      expect(mockProductRepository.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('Stock Update', () => {
    test('updates stock successfully', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 10
      });

      const updatedProduct = new Product({
        ...product.toJSON(),
        stock: 15
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockProductRepository.update.mockResolvedValue(updatedProduct.toJSON());

      const result = await useCase.execute('prod1', 5, 'admin');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stock updated successfully');
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product.stock).toBe(15);
      expect(mockProductRepository.update).toHaveBeenCalledWith('prod1', expect.any(Object));
    });

    test('updates stock to zero', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5
      });

      const updatedProduct = new Product({
        ...product.toJSON(),
        stock: 0
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockProductRepository.update.mockResolvedValue(updatedProduct.toJSON());

      const result = await useCase.execute('prod1', -5, 'admin');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stock updated successfully');
      expect(result.product).toBeInstanceOf(Product);
      expect(result.product.stock).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      mockProductRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute('prod1', 5, 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Stock update failed');
      expect(result.product).toBeNull();
      expect(result.error).toBe('Database error');
    });

    test('handles update errors gracefully', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 10
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockProductRepository.update.mockRejectedValue(new Error('Update failed'));

      const result = await useCase.execute('prod1', 5, 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Stock update failed');
      expect(result.product).toBeNull();
      expect(result.error).toBe('Update failed');
    });
  });

  describe('Business Rules Integration', () => {
    test('creates valid product entity after update', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.99,
        stock: 10
      });

      const updatedProduct = new Product({
        ...product.toJSON(),
        stock: 15
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockProductRepository.update.mockResolvedValue(updatedProduct.toJSON());

      const result = await useCase.execute('prod1', 5, 'admin');

      expect(result.success).toBe(true);
      expect(result.product).toBeInstanceOf(Product);

      // The updated product should be valid according to entity business rules
      expect(result.product.isValid()).toBe(true);
      expect(result.product.stock).toBeGreaterThanOrEqual(0);
    });
  });
});
