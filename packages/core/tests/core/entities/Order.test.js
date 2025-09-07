import { Order, OrderItem } from '../../../entities/Order.js';
import { InvalidTransitionError } from '../../../errors/DomainErrors';

// Test builders
const anOrderItem = (overrides = {}) => new OrderItem({
  productId: 'prod-1',
  productName: 'Apple',
  productPrice: 2.50,
  quantity: 2,
  ...overrides
});

const anOrder = (overrides = {}) => new Order({
  userId: 'user-123',
  items: [anOrderItem()],
  ...overrides
});

describe('Order Entity - Core Domain Rules', () => {
  describe('Creation and Validation', () => {
    test('creates valid order', () => {
      const order = anOrder();
      
      expect(order.isValid()).toBe(true);
      expect(order.userId).toBe('user-123');
      expect(order.status).toBe('pending');
    });

    test('rejects order without user ID', () => {
      const order = new Order({ items: [] });
      expect(order.isValid()).toBe(false);
    });

    test('rejects order without items', () => {
      const order = new Order({ userId: 'user-123', items: [] });
      expect(order.isValid()).toBe(false);
    });

    test('rejects order with invalid status', () => {
      const order = new Order({ userId: 'user-123', items: [], status: 'invalid' });
      expect(order.isValid()).toBe(false);
    });
  });

  describe('Safe Status Transitions - Typed Errors', () => {
    test('confirms pending order', () => {
      const order = anOrder();
      
      expect(order.canBeConfirmed()).toBe(true);
      expect(order.confirm()).toBe(true);
      expect(order.status).toBe('confirmed');
    });

    test('starts processing confirmed order', () => {
      const order = anOrder();
      order.confirm();
      
      expect(order.canBeProcessed()).toBe(true);
      expect(order.startProcessing()).toBe(true);
      expect(order.status).toBe('processing');
    });

    test('ships processing order', () => {
      const order = anOrder();
      order.confirm();
      order.startProcessing();
      
      expect(order.canBeShipped()).toBe(true);
      expect(order.ship('TRACK123')).toBe(true);
      expect(order.status).toBe('shipped');
      expect(order.trackingNumber).toBe('TRACK123');
    });

    test('delivers shipped order', () => {
      const order = anOrder();
      order.confirm();
      order.startProcessing();
      order.ship();
      
      expect(order.canBeDelivered()).toBe(true);
      expect(order.deliver()).toBe(true);
      expect(order.status).toBe('delivered');
    });

    test('cancels pending order', () => {
      const order = anOrder();
      
      expect(order.canBeCancelled()).toBe(true);
      expect(order.cancel('Customer request')).toBe(true);
      expect(order.status).toBe('cancelled');
      expect(order.cancellationReason).toBe('Customer request');
      expect(order.cancelledAt).toBeInstanceOf(Date);
    });

    test('prevents illegal transitions with typed errors', () => {
      const order = anOrder();
      
      expect(() => order.startProcessing()).toThrow("Invalid transition");
      expect(() => order.startProcessing()).toThrow('Invalid transition from pending to processing');
      
      order.confirm();
      expect(() => order.confirm()).toThrow("Invalid transition");
      
      order.startProcessing();
      order.ship();
      order.deliver();
      expect(() => order.cancel()).toThrow("Invalid transition");
    });
  });

  describe('All Illegal Transitions - Table-driven', () => {
    test.each`
      from           | action             | errorType
      ${'pending'}   | ${'ship'}          | ${'Invalid transition'}
      ${'pending'}   | ${'deliver'}       | ${'Invalid transition'}
      ${'confirmed'} | ${'confirm'}       | ${'Invalid transition'}
      ${'confirmed'} | ${'deliver'}       | ${'Invalid transition'}
      ${'processing'}| ${'confirm'}       | ${'Invalid transition'}
      ${'processing'}| ${'deliver'}       | ${'Invalid transition'}
      ${'shipped'}   | ${'confirm'}       | ${'Invalid transition'}
      ${'shipped'}   | ${'startProcessing'}| ${'Invalid transition'}
      ${'delivered'} | ${'confirm'}       | ${'Invalid transition'}
      ${'delivered'} | ${'startProcessing'}| ${'Invalid transition'}
      ${'delivered'} | ${'ship'}          | ${'Invalid transition'}
      ${'delivered'} | ${'cancel'}        | ${'Invalid transition'}
      ${'cancelled'} | ${'confirm'}       | ${'Invalid transition'}
      ${'cancelled'} | ${'startProcessing'}| ${'Invalid transition'}
      ${'cancelled'} | ${'ship'}          | ${'Invalid transition'}
      ${'cancelled'} | ${'deliver'}       | ${'Invalid transition'}
    `('cannot $action from $from', ({ from, action, errorType }) => {
      const order = anOrder({ status: from });
      
      expect(() => order[action]()).toThrow(errorType);
    });
  });

  describe('Status Queries', () => {
    test('checks status correctly', () => {
      const order = anOrder();
      
      expect(order.isPending()).toBe(true);
      expect(order.isConfirmed()).toBe(false);
      
      order.confirm();
      expect(order.isPending()).toBe(false);
      expect(order.isConfirmed()).toBe(true);
    });

    test('checks cancellation capability', () => {
      const order = anOrder();
      
      expect(order.canBeCancelled()).toBe(true);
      order.confirm();
      expect(order.canBeCancelled()).toBe(true);
      order.startProcessing();
      expect(order.canBeCancelled()).toBe(false);
    });
  });

  describe('Payment Status Transitions', () => {
    test('marks order as paid', () => {
      const order = anOrder();
      
      order.markAsPaid('PAY123');
      expect(order.paymentStatus).toBe('paid');
      expect(order.paymentId).toBe('PAY123');
    });

    test('marks payment as failed', () => {
      const order = anOrder();
      
      order.markPaymentFailed();
      expect(order.paymentStatus).toBe('failed');
    });

    test('processes refund only when paid', () => {
      const order = anOrder();
      
      // Cannot refund when not paid
      expect(() => order.refund()).toThrow("Invalid transition");
      expect(() => order.refund()).toThrow('Only paid orders can be refunded');
      
      order.markAsPaid('PAY123');
      order.refund();
      expect(order.paymentStatus).toBe('refunded');
    });
  });

  describe('Total Calculations', () => {
    test('calculates totals correctly', () => {
      const order = anOrder({
        items: [
          anOrderItem({ productPrice: 2.50, quantity: 2 }),
          anOrderItem({ productId: 'prod-2', productName: 'Banana', productPrice: 1.50, quantity: 3 })
        ],
        shippingAmount: 5.00,
        taxAmount: 1.20,
        discountAmount: 2.00
      });
      
      order.calculateTotals();
      
      expect(order.totalAmount).toBe(9.50); // (2.50 * 2) + (1.50 * 3)
      expect(order.finalAmount).toBe(13.70); // 9.50 + 5.00 + 1.20 - 2.00
    });
  });

  describe('OrderItem Entity', () => {
    test('creates valid order item', () => {
      const item = anOrderItem();
      
      expect(item.isValid()).toBe(true);
      expect(item.lineTotal()).toBe(5.00);
    });

    test('rejects invalid order item', () => {
      const item = new OrderItem({ productId: null, productPrice: 0, quantity: 0 });
      expect(item.isValid()).toBe(false);
    });
  });

  describe('JSON Serialization - Contract-based', () => {
    test('serializes order with correct derived values', () => {
      const order = anOrder();
      order.calculateTotals();
      
      const json = order.toJSON();
      
      // Contract: derived values match calculations
      expect(json.finalAmount).toBe(order.finalAmount);
      expect(json.totalAmount).toBe(order.totalAmount);
      expect(json.items[0].lineTotal).toBe(order.items[0].lineTotal());
    });

    test('deserializes order correctly', () => {
      const orderData = {
        userId: 'user-123',
        status: 'confirmed',
        items: [{ productId: 'prod-1', productName: 'Apple', productPrice: 2.50, quantity: 2 }]
      };
      
      const order = Order.fromJSON(orderData);
      expect(order.userId).toBe('user-123');
      expect(order.status).toBe('confirmed');
      expect(order.items).toHaveLength(1);
    });
  });
});
