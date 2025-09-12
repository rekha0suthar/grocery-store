import { CreateOrderUseCase } from '../../../../use-cases/order/CreateOrderUseCase';
import { Order, OrderItem } from '../../../../entities/Order';
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
      const orderData = { items: [], userRole: 'customer' };
      const result = await useCase.execute(null, orderData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty');
      expect(result.order).toBeNull();
    });

    test('rejects when cart is empty', async () => {
      const orderData = { items: [], userRole: 'customer' };
      const result = await useCase.execute('user1', orderData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty');
      expect(result.order).toBeNull();
    });

    test('rejects when cart not found', async () => {
      const orderData = { items: [], userRole: 'customer' };
      const result = await useCase.execute('user1', orderData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty');
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

      const orderData = {
        items: [{
          productId: 'product1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'piece'
        }],
        userRole: 'customer',
        totalAmount: 20.00
      };

      const expectedOrder = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'product1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'piece'
        })],
        totalAmount: 20.00
      });

      mockProductRepository.findById.mockResolvedValue(product);
      mockOrderRepository.create.mockResolvedValue(expectedOrder);

      const result = await useCase.execute('user1', orderData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order created successfully');
      expect(result.order).toMatchObject({
        id: expectedOrder.id,
        userId: expectedOrder.userId,
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
    });

    test('handles product not found', async () => {
      const orderData = {
        items: [{
          productId: 'product1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'piece'
        }],
        userRole: 'customer',
        totalAmount: 20.00
      };

      mockProductRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('user1', orderData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
      expect(result.order).toBeNull();
    });
  });
});
