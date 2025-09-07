import { ProcessOrderUseCase } from '../../../../use-cases/order/ProcessOrderUseCase';
import { Order,OrderItem } from '../../../../entities/Order';

describe('ProcessOrderUseCase - Application Policy', () => {
  let useCase;
  let mockOrderRepository;
  let mockProductRepository;

  beforeEach(() => {
    // Mock repositories
    mockOrderRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    mockProductRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    // Create use case with mocked dependencies
    useCase = new ProcessOrderUseCase({ orderRepo: mockOrderRepository, cartRepo: {}, productRepo: mockProductRepository });
    // useCase.orderRepository = mockOrderRepository;
    // useCase.productRepository = mockProductRepository;
  });

  describe('Input Validation', () => {
    test('rejects missing order ID', async () => {
      const result = await useCase.execute(null, 'admin1', 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
      expect(result.order).toBeNull();
    });

    test('rejects missing processor ID', async () => {
      const result = await useCase.execute('order1', 'confirm', 'admin', null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
      expect(result.order).toBeNull();
    });

    test('rejects missing processor role', async () => {
      const result = await useCase.execute('order1', 'confirm', null, 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to process order');
      expect(result.order).toBeNull();
    });
  });

  describe('Authorization', () => {
    test('rejects when user is not authorized to process orders', async () => {
      const result = await useCase.execute('order1', 'user1', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to process order');
      expect(result.order).toBeNull();
    });

    test('allows admin to process orders', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'pending'
      });

      const updatedOrderData = {
        ...order.toJSON(),
        status: 'processing',
        processedBy: 'admin1',
        processedAt: new Date(),
        updatedAt: new Date()
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrderData);

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order confirmed successfully');
      expect(result.order).toBeInstanceOf(Order);
      expect(result.order.status).toBe('processing');
      expect(result.order.processedBy).toBe('admin1');
    });

    test('allows store manager to process orders', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 1,
          unit: 'pc',
          totalPrice: 10.00
        })],
        totalAmount: 10.00,
        status: 'pending'
      });

      const updatedOrderData = {
        ...order.toJSON(),
        status: 'processing',
        processedBy: 'manager1',
        processedAt: new Date(),
        updatedAt: new Date()
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrderData);

      const result = await useCase.execute('order1', 'confirm', 'store_manager', 'manager1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order confirmed successfully');
      expect(result.order).toBeInstanceOf(Order);
      expect(result.order.status).toBe('processing');
      expect(result.order.processedBy).toBe('manager1');
    });
  });

  describe('Order Lookup', () => {
    test('rejects when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('nonexistent', 'admin1', 'admin');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
      expect(result.order).toBeNull();
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('Order Processing', () => {
    test('processes pending order successfully', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'pending'
      });

      const updatedOrderData = {
        ...order.toJSON(),
        status: 'processing',
        processedBy: 'admin1',
        processedAt: new Date(),
        updatedAt: new Date()
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrderData);

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order confirmed successfully');
      expect(result.order).toBeInstanceOf(Order);
      expect(result.order.status).toBe('processing');
      expect(result.order.processedBy).toBe('admin1');

      expect(mockOrderRepository.update).toHaveBeenCalled();
    });

    test('rejects already processed order', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'processing',
        processedBy: 'admin1'
      });

      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot confirm order with status processing');
      expect(result.order).toBeNull();
    });

    test('rejects completed order', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'delivered',
        processedBy: 'admin1'
      });

      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot confirm order with status delivered');
      expect(result.order).toBeNull();
    });

    test('rejects cancelled order', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'cancelled'
      });

      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Cannot confirm order with status cancelled');
      expect(result.order).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles repository errors gracefully', async () => {
      mockOrderRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to process order');
      expect(result.order).toBeNull();
      expect(result.error).toBe('Database connection failed');
    });

    test('handles update errors gracefully', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'pending'
      });

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockRejectedValue(new Error('Failed to update order'));

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to process order');
      expect(result.order).toBeNull();
      expect(result.error).toBe('Failed to update order');
    });
  });

  describe('Business Rules Integration', () => {
    test('uses order entity business rules for status transition', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'pending'
      });

      const updatedOrderData = {
        ...order.toJSON(),
        status: 'processing',
        processedBy: 'admin1',
        processedAt: new Date(),
        updatedAt: new Date()
      };

      // Spy on the entity method
      const confirmSpy = jest.spyOn(order, 'startProcessing');

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrderData);

      await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    test('creates valid order entity after processing', async () => {
      const order = new Order({
        id: 'order1',
        userId: 'user1',
        items: [new OrderItem({
          productId: 'prod1',
          productName: 'Test Product',
          productPrice: 10.00,
          quantity: 2,
          unit: 'pc',
          totalPrice: 20.00
        })],
        totalAmount: 20.00,
        status: 'pending'
      });

      const updatedOrderData = {
        ...order.toJSON(),
        status: 'processing',
        processedBy: 'admin1',
        processedAt: new Date(),
        updatedAt: new Date()
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue(updatedOrderData);

      const result = await useCase.execute('order1', 'confirm', 'admin', 'admin1');

      expect(result.success).toBe(true);
      expect(result.order).toBeInstanceOf(Order);
      expect(result.order.isValid()).toBe(true);
      expect(result.order.status).toBe('processing');
    });
  });
});
