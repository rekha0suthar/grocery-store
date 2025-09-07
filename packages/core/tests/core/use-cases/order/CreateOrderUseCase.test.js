import { CreateOrderUseCase } from '../../../../use-cases/order/CreateOrderUseCase';
import { Order, OrderItem } from '../../../../entities/Order';
import { Cart } from '../../../../entities/Cart';
import { CartItem } from '../../../../entities/CartItem';
import { Product } from '../../../../entities/Product';

describe('CreateOrderUseCase - Application Policy', () => {
  let useCase;
  let mockOrderRepository;
  let mockCartRepository;
  let mockProductRepository;

  beforeEach(() => {
    // Mock repositories
    mockOrderRepository = {
      create: jest.fn()
    };

    mockCartRepository = {
      findByUserId: jest.fn(),
      clear: jest.fn(),
      findById: jest.fn(),
    };

    mockProductRepository = {
      findById: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new CreateOrderUseCase({ orderRepo: mockOrderRepository, cartRepo: mockCartRepository, productRepo: mockProductRepository });
  });

  describe('Input Validation', () => {
    test('rejects missing user ID', async () => {
      const result = await useCase.execute(null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart not found');
      expect(result.order).toBeNull();
    });

    test('rejects when cart is empty', async () => {
      const emptyCart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: []
      });

      mockCartRepository.findByUserId.mockResolvedValue(emptyCart);

      const result = await useCase.execute('user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty');
      expect(result.order).toBeNull();
    });

    test('rejects when cart not found', async () => {
      mockCartRepository.findByUserId.mockResolvedValue(null);

      const result = await useCase.execute('user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart not found');
      expect(result.order).toBeNull();
    });
  });

  describe('Order Creation', () => {
    test('creates order successfully', async () => {
      const product = new Product({
        id: 'product1',
        name: 'Test Product',
        price: 10.00,
        stock: 100
      });

      const cartItem = new CartItem({
        id: 'item1',
        productId: 'product1',
        quantity: 2
      });

      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [cartItem]
      });

      const expectedOrder = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'product1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2
        })],
        totalAmount: 20.00
      });

      mockCartRepository.findByUserId.mockResolvedValue(cart);
      mockProductRepository.findById.mockResolvedValue(product);
      mockOrderRepository.create.mockResolvedValue(expectedOrder);

      const result = await useCase.execute('user1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order created successfully');
      expect(result.order).toMatchObject({
        id: expectedOrder.id,
        userId: expectedOrder.userId,
        totalAmount: expectedOrder.totalAmount,
        status: expectedOrder.status,
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: "product1",
            productName: "Test Product",
            productPrice: 10.00,
            quantity: 2
          })
        ])
      });
      expect(result.order.createdAt).toBeInstanceOf(Date);
      expect(result.order.updatedAt).toBeInstanceOf(Date);
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockCartRepository.clear).toHaveBeenCalledWith('cart1');
    });

    test('handles product not found', async () => {
      const cartItem = new CartItem({
        id: 'item1',
        productId: 'product1',
        quantity: 2
      });

      const cart = new Cart({
        id: 'cart1',
        userId: 'user1',
        items: [cartItem]
      });

      mockCartRepository.findByUserId.mockResolvedValue(cart);
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('user1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
      expect(result.order).toBeNull();
    });
  });
});
