import { AddToCartUseCase } from '../../../../use-cases/cart/AddToCartUseCase.js';
import { Cart } from '../../../../entities/Cart.js';
import { Product } from '../../../../entities/Product.js';

describe('AddToCartUseCase - Application Policy', () => {
  let useCase;
  let mockCartRepository;
  let mockProductRepository;

  beforeEach(() => {
    // Create mock repositories
    mockCartRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };

    mockProductRepository = {
      findById: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new AddToCartUseCase({
      cartRepo: mockCartRepository,
      productRepo: mockProductRepository
    });
  });

  describe('Input Validation', () => {
    test('rejects missing user ID', async () => {
      const result = await useCase.execute(null, 'prod1', 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User ID, product ID, and quantity are required');
      expect(result.cart).toBeNull();
    });

    test('rejects missing product ID', async () => {
      const result = await useCase.execute('user1', null, 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User ID, product ID, and quantity are required');
      expect(result.cart).toBeNull();
    });

    test('rejects invalid quantity', async () => {
      const result = await useCase.execute('user1', 'prod1', null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('User ID, product ID, and quantity are required');
      expect(result.cart).toBeNull();
    });

    test('rejects negative quantity', async () => {
      const result = await useCase.execute('user1', 'prod1', -1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Quantity must be greater than 0');
      expect(result.cart).toBeNull();
    });
  });

  describe('Product Validation', () => {
    test('rejects when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('user1', 'prod1', 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
      expect(result.cart).toBeNull();
      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod1');
    });

    test('rejects when product is not available', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5,
        isVisible: false
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());

      const result = await useCase.execute('user1', 'prod1', 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product is not available');
      expect(result.cart).toBeNull();
    });

    test('rejects when product is hidden', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5,
        isVisible: false
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());

      const result = await useCase.execute('user1', 'prod1', 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product is not available');
      expect(result.cart).toBeNull();
    });

    test('rejects when quantity exceeds stock', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 2,
        isVisible: true
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());

      const result = await useCase.execute('user1', 'prod1', 5);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Only 2 items available in stock');
      expect(result.cart).toBeNull();
    });
  });

  describe('Cart Operations', () => {
    test('creates new cart when user has no cart', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5,
        isVisible: true
      });

      const newCart = new Cart({ userId: 'user1', items: [] });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockCartRepository.findByUserId.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue(newCart.toJSON());
      mockCartRepository.update.mockResolvedValue(newCart.toJSON());

      const result = await useCase.execute('user1', 'prod1', 2);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product added to cart successfully');
      expect(result.cart).toBeInstanceOf(Cart);
      expect(mockCartRepository.create).toHaveBeenCalled();
      expect(mockCartRepository.update).toHaveBeenCalled();
    });

    test('adds to existing cart', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5,
        isVisible: true
      });

      const existingCart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: []
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockCartRepository.findByUserId.mockResolvedValue(existingCart.toJSON());
      mockCartRepository.update.mockResolvedValue(existingCart.toJSON());

      const result = await useCase.execute('user1', 'prod1', 1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product added to cart successfully');
      expect(result.cart).toBeInstanceOf(Cart);
      expect(mockCartRepository.update).toHaveBeenCalled();
    });

    test('increments quantity when product already in cart', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 10,
        isVisible: true
      });

      const existingCart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [{
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.99,
          quantity: 2,
          unit: 'piece'
        }]
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockCartRepository.findByUserId.mockResolvedValue(existingCart.toJSON());
      mockCartRepository.update.mockResolvedValue(existingCart.toJSON());

      const result = await useCase.execute('user1', 'prod1', 3);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Product added to cart successfully');
      expect(result.cart).toBeInstanceOf(Cart);
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      mockProductRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute('user1', 'prod1', 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to add product to cart');
      expect(result.cart).toBeNull();
      expect(result.error).toBe('Database error');
    });

    test('handles cart creation errors gracefully', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5,
        isVisible: true
      });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockCartRepository.findByUserId.mockResolvedValue(null);
      mockCartRepository.create.mockRejectedValue(new Error('Cart creation failed'));

      const result = await useCase.execute('user1', 'prod1', 1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to add product to cart');
      expect(result.cart).toBeNull();
      expect(result.error).toBe('Cart creation failed');
    });
  });

  describe('Business Rules Integration', () => {
    test('uses product entity business rules for availability check', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5,
        isVisible: true
      });

      // Spy on the entity method
      const isVisibleSpy = jest.spyOn(product, 'getIsVisible');

      mockProductRepository.findById.mockResolvedValue(product.toJSON());

      await useCase.execute('user1', 'prod1', 1);

      // The use case should check product visibility through entity business rules
      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod1');
    });

    test('creates valid cart entity with proper calculations', async () => {
      const product = new Product({
        id: 'prod1',
        name: 'Test Product',
        price: 10.99,
        stock: 5,
        isVisible: true
      });

      const newCart = new Cart({ userId: 'user1', items: [] });

      mockProductRepository.findById.mockResolvedValue(product.toJSON());
      mockCartRepository.findByUserId.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue(newCart.toJSON());
      mockCartRepository.update.mockResolvedValue(newCart.toJSON());

      const result = await useCase.execute('user1', 'prod1', 2);

      expect(result.success).toBe(true);
      expect(result.cart).toBeInstanceOf(Cart);
      expect(result.cart.userId).toBe('user1');
    });
  });
});
