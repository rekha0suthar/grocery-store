import { orderService } from '../../services/orderService.js';

// Mock the api service
jest.mock('../../services/api.js', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

import api from '../../services/api.js';

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should fetch orders', async () => {
      const mockOrders = [
        { id: '1', userId: 'user1', totalAmount: 100, status: 'pending' },
        { id: '2', userId: 'user2', totalAmount: 200, status: 'completed' }
      ];
      api.get.mockResolvedValue({ data: mockOrders });

      const result = await orderService.getOrders();

      expect(api.get).toHaveBeenCalledWith('/orders');
      expect(result).toEqual({ data: mockOrders });
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      api.get.mockRejectedValue(error);

      await expect(orderService.getOrders()).rejects.toThrow('API Error');
    });
  });

  describe('getOrderById', () => {
    it('should fetch an order by ID', async () => {
      const mockOrder = { id: '1', userId: 'user1', totalAmount: 100, status: 'pending' };
      api.get.mockResolvedValue({ data: mockOrder });

      const result = await orderService.getOrderById('1');

      expect(api.get).toHaveBeenCalledWith('/orders/1');
      expect(result).toEqual({ data: mockOrder });
    });

    it('should handle API errors', async () => {
      const error = new Error('Order not found');
      api.get.mockRejectedValue(error);

      await expect(orderService.getOrderById('1')).rejects.toThrow('Order not found');
    });
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const newOrder = { userId: 'user1', items: [], totalAmount: 150 };
      const createdOrder = { id: '3', ...newOrder, status: 'pending' };
      api.post.mockResolvedValue({ data: createdOrder });

      const result = await orderService.createOrder(newOrder);

      expect(api.post).toHaveBeenCalledWith('/orders', newOrder);
      expect(result).toEqual({ data: createdOrder });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to create order');
      api.post.mockRejectedValue(error);

      await expect(orderService.createOrder({})).rejects.toThrow('Failed to create order');
    });
  });

  describe('updateOrder', () => {
    it('should update an existing order', async () => {
      const orderId = '1';
      const updatedOrder = { status: 'completed', totalAmount: 120 };
      const resultOrder = { id: orderId, ...updatedOrder };
      api.put.mockResolvedValue({ data: resultOrder });

      const result = await orderService.updateOrder(orderId, updatedOrder);

      expect(api.put).toHaveBeenCalledWith(`/orders/${orderId}`, updatedOrder);
      expect(result).toEqual({ data: resultOrder });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to update order');
      api.put.mockRejectedValue(error);

      await expect(orderService.updateOrder('1', {})).rejects.toThrow('Failed to update order');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      api.put.mockResolvedValue({ data: { success: true } });

      const result = await orderService.cancelOrder('1', 'Customer request');

      expect(api.put).toHaveBeenCalledWith('/orders/1/cancel', { reason: 'Customer request' });
      expect(result).toEqual({ data: { success: true } });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to cancel order');
      api.put.mockRejectedValue(error);

      await expect(orderService.cancelOrder('1', 'reason')).rejects.toThrow('Failed to cancel order');
    });
  });

  describe('getOrderHistory', () => {
    it('should fetch order history', async () => {
      const mockHistory = [
        { id: '1', userId: 'user1', totalAmount: 100, status: 'completed', createdAt: '2023-01-01' },
        { id: '2', userId: 'user1', totalAmount: 200, status: 'completed', createdAt: '2023-01-02' }
      ];
      api.get.mockResolvedValue({ data: mockHistory });

      const result = await orderService.getOrderHistory();

      expect(api.get).toHaveBeenCalledWith('/orders/history');
      expect(result).toEqual({ data: mockHistory });
    });

    it('should handle API errors', async () => {
      const error = new Error('Failed to fetch order history');
      api.get.mockRejectedValue(error);

      await expect(orderService.getOrderHistory()).rejects.toThrow('Failed to fetch order history');
    });
  });
});
