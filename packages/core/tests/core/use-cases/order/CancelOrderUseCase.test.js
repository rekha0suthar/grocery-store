import { FakeClock } from "../../../utils/FakeClock.js";
import { CancelOrderUseCase } from '../../../../use-cases/order/CancelOrderUseCase';

describe('CancelOrderUseCase', () => {
  let useCase;
  let mockOrderRepository;
  let mockProductRepository;

  beforeEach(() => {
  let mockClock;
    // Mock repositories
    mockOrderRepository = {
      findById: jest.fn(),
      update: jest.fn()
    };

    mockProductRepository = {
      addStock: jest.fn()
    };
    mockClock = new FakeClock();

    // Create use case with mocked dependencies
    useCase = new CancelOrderUseCase({ 
      orderRepo: mockOrderRepository, 
      productRepo: mockProductRepository,
      clock: mockClock 
    });
  });

  describe('Constructor', () => {
    test('should initialize with repositories', () => {
      expect(useCase.orderRepository).toBe(mockOrderRepository);
      expect(useCase.productRepository).toBe(mockProductRepository);
    });
  });

  describe('canCancelOrder', () => {
    test('should allow cancellation for valid roles', () => {
      expect(useCase.canCancelOrder('customer')).toBe(true);
      expect(useCase.canCancelOrder('admin')).toBe(true);
      expect(useCase.canCancelOrder('store_manager')).toBe(true);
    });

    test('should deny cancellation for invalid roles', () => {
      expect(useCase.canCancelOrder('guest')).toBe(false);
      expect(useCase.canCancelOrder('invalid_role')).toBe(false);
      expect(useCase.canCancelOrder('')).toBe(false);
      expect(useCase.canCancelOrder(null)).toBe(false);
    });
  });

  describe('canOrderBeCancelled', () => {
    test('should allow cancellation for cancellable statuses', () => {
      const pendingOrder = { status: 'pending' };
      const confirmedOrder = { status: 'confirmed' };

      expect(useCase.canOrderBeCancelled(pendingOrder)).toBe(true);
      expect(useCase.canOrderBeCancelled(confirmedOrder)).toBe(true);
    });

    test('should deny cancellation for non-cancellable statuses', () => {
      const shippedOrder = { status: 'shipped' };
      const deliveredOrder = { status: 'delivered' };
      const cancelledOrder = { status: 'cancelled' };

      expect(useCase.canOrderBeCancelled(shippedOrder)).toBe(false);
      expect(useCase.canOrderBeCancelled(deliveredOrder)).toBe(false);
      expect(useCase.canOrderBeCancelled(cancelledOrder)).toBe(false);
    });
  });

  describe('restoreStockQuantities', () => {
    test('should restore stock for all order items', async () => {
      const orderItems = [
        { productId: 'prod1', quantity: 2 },
        { productId: 'prod2', quantity: 1 }
      ];

      mockProductRepository.addStock
        .mockResolvedValueOnce({ id: 'prod1', stock: 10 })
        .mockResolvedValueOnce({ id: 'prod2', stock: 5 });

      const result = await useCase.restoreStockQuantities(orderItems);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Stock restored successfully');
      expect(result.restorations).toHaveLength(2);
      expect(mockProductRepository.addStock).toHaveBeenCalledTimes(2);
      expect(mockProductRepository.addStock).toHaveBeenCalledWith('prod1', 2);
      expect(mockProductRepository.addStock).toHaveBeenCalledWith('prod2', 1);
    });

    test('should handle stock restoration failure', async () => {
      const orderItems = [
        { productId: 'prod1', quantity: 2 }
      ];

      mockProductRepository.addStock.mockResolvedValue(null);

      const result = await useCase.restoreStockQuantities(orderItems);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to restore stock for product prod1');
    });

    test('should handle stock restoration error', async () => {
      const orderItems = [
        { productId: 'prod1', quantity: 2 }
      ];

      mockProductRepository.addStock.mockRejectedValue(new Error('Database error'));

      const result = await useCase.restoreStockQuantities(orderItems);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to restore stock quantities');
      expect(result.error).toBe('Database error');
    });
  });

  describe('execute', () => {
    const mockOrder = {
      id: 'order1',
      userId: 'user1',
      status: 'pending',
      items: [
        { productId: 'prod1', quantity: 2 },
        { productId: 'prod2', quantity: 1 }
      ]
    };

    beforeEach(() => {
      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.update.mockResolvedValue({
        ...mockOrder,
        status: 'cancelled',
        cancelledAt: '2023-01-01T00:00:00.000Z',
        cancellationReason: 'Customer request'
      });
      mockProductRepository.addStock
        .mockResolvedValueOnce({ id: 'prod1', stock: 10 })
        .mockResolvedValueOnce({ id: 'prod2', stock: 5 });
    });

    test('should successfully cancel order', async () => {
      const result = await useCase.execute('order1', 'user1', 'customer', 'Customer request');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order cancelled successfully');
      expect(result.order).toBeDefined();
      expect(result.order.status).toBe('cancelled');
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order1');
      expect(mockOrderRepository.update).toHaveBeenCalledWith('order1', expect.objectContaining({
        status: 'cancelled',
        cancellationReason: 'Customer request'
      }));
    });

    test('should reject cancellation without order ID', async () => {
      const result = await useCase.execute(null, 'user1', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order ID is required');
      expect(result.order).toBeNull();
    });

    test('should reject cancellation with invalid role', async () => {
      const result = await useCase.execute('order1', 'user1', 'guest');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient permissions to cancel order');
      expect(result.order).toBeNull();
    });

    test('should reject cancellation for non-existent order', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('order1', 'user1', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order not found');
      expect(result.order).toBeNull();
    });

    test('should reject cancellation for other user\'s order (customer)', async () => {
      const result = await useCase.execute('order1', 'user2', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('You can only cancel your own orders');
      expect(result.order).toBeNull();
    });

    test('should allow admin to cancel any order', async () => {
      const result = await useCase.execute('order1', 'user2', 'admin');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order cancelled successfully');
    });

    test('should allow store manager to cancel any order', async () => {
      const result = await useCase.execute('order1', 'user2', 'store_manager');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order cancelled successfully');
    });

    test('should reject cancellation for non-cancellable status', async () => {
      const shippedOrder = { ...mockOrder, status: 'shipped' };
      mockOrderRepository.findById.mockResolvedValue(shippedOrder);

      const result = await useCase.execute('order1', 'user1', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Order cannot be cancelled in its current status');
      expect(result.order).toBeNull();
    });

    test('should handle stock restoration failure gracefully', async () => {
      mockProductRepository.addStock.mockResolvedValue(null);

      const result = await useCase.execute('order1', 'user1', 'customer');

      expect(result.success).toBe(true); // Order cancellation should still succeed
      expect(result.message).toBe('Order cancelled successfully');
    });

    test('should handle repository errors', async () => {
      mockOrderRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute('order1', 'user1', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to cancel order');
      expect(result.error).toBe('Database error');
    });

    test('should handle update errors', async () => {
      mockOrderRepository.update.mockRejectedValue(new Error('Update failed'));

      const result = await useCase.execute('order1', 'user1', 'customer');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to cancel order');
      expect(result.error).toBe('Update failed');
    });
  });
});
