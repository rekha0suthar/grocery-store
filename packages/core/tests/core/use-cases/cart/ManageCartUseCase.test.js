import { ManageCartUseCase } from '../../../../use-cases/cart/ManageCartUseCase';
import { Cart } from '../../../../entities/Cart';
import { CartItem } from '../../../../entities/CartItem';

describe('ManageCartUseCase - Application Policy', () => {
  let useCase;
  let mockCartRepository;
  let mockProductRepository;

  beforeEach(() => {
    // Mock repository
    mockCartRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockProductRepository = {
      findById: jest.fn()
    };
    
    // Create use case with mocked dependencies
    useCase = new ManageCartUseCase({ cartRepo: mockCartRepository, productRepo: mockProductRepository });
    // useCase.cartRepository = mockCartRepository;
  });

  describe('Get Cart', () => {
    test('retrieves cart successfully', async () => {
      const cartData = {
        id: 'cart1',
        userId: 'user1',
        items: [{
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc'
        }],
        totalAmount: 20.00,
        totalItems: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartRepository.findByUserId.mockResolvedValue(cartData);
      
      const result = await useCase.getCart('user1');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart retrieved successfully');
      expect(result.cart).toBeInstanceOf(Cart);
      expect(result.cart.userId).toBe('user1');
      expect(result.cart.items).toHaveLength(1);
      expect(mockCartRepository.findByUserId).toHaveBeenCalledWith('user1');
    });

    test('creates new cart when user has no cart', async () => {
      const newCartData = {
        id: 'cart1',
        userId: 'user1',
        items: [],
        totalAmount: 0,
        totalItems: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartRepository.findByUserId.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue(newCartData);
      
      const result = await useCase.getCart('user1');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart retrieved successfully');
      expect(result.cart).toBeInstanceOf(Cart);
      expect(result.cart.userId).toBe('user1');
      expect(result.cart.items).toHaveLength(0);
      expect(mockCartRepository.create).toHaveBeenCalled();
    });

    test('handles repository errors', async () => {
      mockCartRepository.findByUserId.mockRejectedValue(new Error('Database connection failed'));
      
      const result = await useCase.getCart('user1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve cart');
      expect(result.cart).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('Update Cart Item', () => {
    test('updates item quantity successfully', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [new CartItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc'
        })],
        totalAmount: 20.00,
        totalItems: 2
      });
      
      const updatedCartData = {
        ...cart.toJSON(),
        items: [{
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 5,
          unit: 'pc'
        }],
        totalAmount: 50.00,
        totalItems: 5,
        updatedAt: new Date()
      };
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      mockCartRepository.update.mockResolvedValue(updatedCartData);
      
      const result = await useCase.updateCartItem('user1', 'prod1', 5);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart updated successfully');
      expect(result.cart).toBeInstanceOf(Cart);
      expect(result.cart.items[0].quantity).toBe(5);
      expect(result.cart.totalAmount).toBe(50.00);
    });

    test('removes item when quantity is zero', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [new CartItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc'
        })],
        totalAmount: 20.00,
        totalItems: 2
      });
      
      const updatedCartData = {
        ...cart.toJSON(),
        items: [],
        totalAmount: 0,
        totalItems: 0,
        updatedAt: new Date()
      };
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      mockCartRepository.update.mockResolvedValue(updatedCartData);
      
      const result = await useCase.updateCartItem('user1', 'prod1', 0);
      
      expect(result.success).toBe(true);
      expect(result.cart.items).toHaveLength(0);
      expect(result.cart.totalAmount).toBe(0);
    });

    test('handles item not found', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      
      const result = await useCase.updateCartItem('user1', 'nonexistent', 5);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart updated successfully');
      expect(result.cart).toBeInstanceOf(Cart);
    });
  });

  describe('Remove Cart Item', () => {
    test('removes item successfully', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [new CartItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc'
        })],
        totalAmount: 20.00,
        totalItems: 2
      });
      
      const updatedCartData = {
        ...cart.toJSON(),
        items: [],
        totalAmount: 0,
        totalItems: 0,
        updatedAt: new Date()
      };
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      mockCartRepository.update.mockResolvedValue(updatedCartData);
      
      const result = await useCase.removeCartItem('user1', 'prod1');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Item removed from cart successfully');
      expect(result.cart).toBeInstanceOf(Cart);
      expect(result.cart.items).toHaveLength(0);
    });

    test('handles item not found', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      
      const result = await useCase.removeCartItem('user1', 'nonexistent');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Item not found in cart');
      expect(result.cart).toBeNull();
    });
  });

  describe('Clear Cart', () => {
    test('clears cart successfully', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [new CartItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc'
        })],
        totalAmount: 20.00,
        totalItems: 2
      });
      
      const clearedCartData = {
        ...cart.toJSON(),
        items: [],
        totalAmount: 0,
        totalItems: 0,
        updatedAt: new Date()
      };
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      mockCartRepository.update.mockResolvedValue(clearedCartData);
      
      const result = await useCase.clearCart('user1');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart cleared successfully');
      expect(result.cart).toBeInstanceOf(Cart);
      expect(result.cart.items).toHaveLength(0);
      expect(result.cart.totalAmount).toBe(0);
    });

    test('handles empty cart', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      
      const result = await useCase.clearCart('user1');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart cleared successfully');
      expect(result.cart.items).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      mockCartRepository.findByUserId.mockRejectedValue(new Error('Database connection failed'));
      
      const result = await useCase.getCart('user1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve cart');
      expect(result.cart).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });

    test('handles update errors gracefully', async () => {
      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [new CartItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc'
        })],
        totalAmount: 20.00,
        totalItems: 2
      });
      
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockProductRepository.findById.mockResolvedValue({ id: 'prod1', name: 'Test Product', price: 10.00, stock: 10 });
      mockCartRepository.findByUserId.mockResolvedValue(cart.toJSON());
      mockCartRepository.update.mockRejectedValue(new Error('Failed to update cart'));
      
      const result = await useCase.updateCartItem('user1', 'prod1', 5);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update cart');
      expect(result.cart).toBeNull();
      expect(result.error).toBe('Failed to update cart');
    });
  });

  describe('Business Rules Integration', () => {
    test('maintains cart entity invariants', async () => {
      const cartData = {
        id: 'cart1',
        userId: 'user1',
        items: [{
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc'
        }],
        totalAmount: 20.00,
        totalItems: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockCartRepository.findByUserId.mockResolvedValue(cartData);
      
      const result = await useCase.getCart('user1');
      
      expect(result.success).toBe(true);
      expect(result.cart).toBeInstanceOf(Cart);
      expect(result.cart.isValid()).toBe(true);
      expect(result.cart.totalAmount).toBe(20.00);
      expect(result.cart.totalItems).toBe(2);
    });
  });
});
