import { Order } from '../../entities/Order.js';


export class CancelOrderUseCase {
  constructor({ orderRepo, productRepo }) {
    this.orderRepository = orderRepo;
    this.productRepository = productRepo;
  }

  async execute(orderId, userId, userRole, cancellationReason = '') {
    try {
      if (!orderId) {
        return {
          success: false,
          message: 'Order ID is required',
          order: null
        };
      }

      if (!this.canCancelOrder(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to cancel order',
          order: null
        };
      }

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          order: null
        };
      }

      if (userRole === 'customer' && order.userId !== userId) {
        return {
          success: false,
          message: 'You can only cancel your own orders',
          order: null
        };
      }

      if (!this.canOrderBeCancelled(order)) {
        return {
          success: false,
          message: 'Order cannot be cancelled in its current status',
          order: null
        };
      }

      const stockRestorationResult = await this.restoreStockQuantities(order.items);
      if (!stockRestorationResult.success) {
        console.error('Stock restoration failed:', stockRestorationResult.message);
      }

      const updatedOrder = await this.orderRepository.update(orderId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancellationReason: cancellationReason,
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Order cancelled successfully',
        order: updatedOrder
      };

    } catch (error) {
      console.error('CancelOrderUseCase error:', error);
      return {
        success: false,
        message: 'Failed to cancel order',
        order: null,
        error: error.message
      };
    }
  }

  canCancelOrder(userRole) {
    return ['customer', 'admin', 'store_manager'].includes(userRole);
  }

  canOrderBeCancelled(order) {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(order.status);
  }

  async restoreStockQuantities(orderItems) {
    try {
      const stockRestorations = [];

      for (const item of orderItems) {
        const restoredProduct = await this.productRepository.addStock(item.productId, item.quantity);
        if (!restoredProduct) {
          return {
            success: false,
            message: `Failed to restore stock for product ${item.productId}`
          };
        }
        stockRestorations.push({
          productId: item.productId,
          quantity: item.quantity,
          newStock: restoredProduct.stock
        });
      }

      return {
        success: true,
        message: 'Stock restored successfully',
        restorations: stockRestorations
      };
    } catch (error) {
      console.error('Stock restoration error:', error);
      return {
        success: false,
        message: 'Failed to restore stock quantities',
        error: error.message
      };
    }
  }
} 
