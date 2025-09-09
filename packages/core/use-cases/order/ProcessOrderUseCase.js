import { DefaultClock } from "../../adapters/DefaultClock.js";
import { Order } from '../../entities/Order.js';

export class ProcessOrderUseCase {
  /**
   * @param {{ orderRepo: { findById(id):Promise<Order>, update(id, data):Promise<Order> }, cartRepo: { findById(id):Promise<Cart> }, productRepo: { findById(id):Promise<Product>, update(id, data):Promise<Product> } }} deps
   */
  constructor({ orderRepo, cartRepo, productRepo }, clock = null) {
    this.orderRepository = orderRepo;
    this.cartRepository = cartRepo;
    this.productRepository = productRepo;
    this.clock = clock || new DefaultClock();
  }

  async execute(orderId, action, userRole, userId) {
    try {
      // Authorization check
      if (!this.canProcessOrder(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to process order',
          order: null
        };
      }

      // Get order
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          order: null
        };
      }

      // Validate order can be processed
      if (!this.canProcessOrderStatus(order.status, action)) {
        return {
          success: false,
          message: `Cannot ${action} order with status ${order.status}`,
          order: null
        };
      }

      // Process based on action
      switch (action) {
        case 'confirm':
          return await this.confirmOrder(order, userId);
        case 'ship':
          return await this.shipOrder(order, userId);
        case 'deliver':
          return await this.deliverOrder(order, userId);
        case 'cancel':
          return await this.cancelOrder(order, userId);
        default:
          return {
            success: false,
            message: 'Invalid action',
            order: null
          };
      }

    } catch (error) {
      console.error('ProcessOrderUseCase error:', error);
      return {
        success: false,
        message: 'Failed to process order',
        order: null,
        error: error.message
      };
    }
  }

  canProcessOrder(userRole) {
    return ['admin', 'store_manager'].includes(userRole);
  }

  canProcessOrderStatus(currentStatus, action) {
    const validTransitions = {
      'pending': ['confirm', 'cancel'],
      'confirmed': ['ship', 'cancel'],
      'shipped': ['deliver'],
      'delivered': [],
      'cancelled': []
    };

    return validTransitions[currentStatus]?.includes(action) || false;
  }

  async confirmOrder(order, userId) {
    // Use entity business logic - start processing instead of just confirming
    const orderEntity = order instanceof Order ? order : Order.fromJSON(order);
    orderEntity.confirm();
    orderEntity.startProcessing();
    orderEntity.processedBy = userId;
    orderEntity.processedAt = this.clock.now();
    
    // Update order in repository
    const updatedOrder = await this.orderRepository.update(order.id, orderEntity.toJSON());

    return {
      success: true,
      message: 'Order confirmed successfully',
      order: Order.fromJSON(updatedOrder)
    };
  }

  async shipOrder(order, userId) {
    // Update order status
    const updatedOrder = await this.orderRepository.update(order.id, {
      ...order,
      status: 'shipped',
      shippedAt: this.clock.now().toISOString(),
      shippedBy: userId
    });

    return {
      success: true,
      message: 'Order shipped successfully',
      order: Order.fromJSON(updatedOrder)
    };
  }

  async deliverOrder(order, userId) {
    // Update order status
    const updatedOrder = await this.orderRepository.update(order.id, {
      ...order,
      status: 'delivered',
      deliveredAt: this.clock.now().toISOString(),
      deliveredBy: userId
    });

    return {
      success: true,
      message: 'Order delivered successfully',
      order: Order.fromJSON(updatedOrder)
    };
  }

  async cancelOrder(order, userId) {
    // Restore product stock
    await this.restoreProductStock(order.items);

    // Update order status
    const updatedOrder = await this.orderRepository.update(order.id, {
      ...order,
      status: 'cancelled',
      cancelledAt: this.clock.now().toISOString(),
      cancelledBy: userId
    });

    return {
      success: true,
      message: 'Order cancelled successfully',
      order: Order.fromJSON(updatedOrder)
    };
  }

  async restoreProductStock(orderItems) {
    for (const item of orderItems) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        await this.productRepository.update(item.productId, {
          ...product,
          stock: product.stock + item.quantity
        });
      }
    }
  }
}


