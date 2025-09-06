import { OrderRepository } from '../repositories/OrderRepository.js';
import { CartRepository } from '../repositories/CartRepository.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import { Order } from '../entities/Order.js';
import appConfig from '../config/appConfig.js';


export class ProcessOrderUseCase {
  constructor() {
    this.orderRepository = new OrderRepository(appConfig.getDatabaseType());
    this.cartRepository = new CartRepository(appConfig.getDatabaseType());
    this.productRepository = new ProductRepository(appConfig.getDatabaseType());
  }

  async createOrder(userId, orderData) {
    try {
      const validation = this.validateOrderData(orderData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          order: null
        };
      }

      const cart = await this.cartRepository.findByUserId(userId);
      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          message: 'Cart is empty',
          order: null
        };
      }

      const stockValidation = await this.validateCartStock(cart.items);
      if (!stockValidation.isValid) {
        return {
          success: false,
          message: stockValidation.message,
          order: null
        };
      }

      const orderEntity = new Order({
        userId,
        items: cart.items,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        status: 'pending'
      });

      const createdOrder = await this.orderRepository.create(orderEntity.toJSON());

      await this.cartRepository.update(cart.id, { items: [], totalAmount: 0 });

      await this.updateProductStock(cart.items);

      return {
        success: true,
        message: 'Order created successfully',
        order: Order.fromJSON(createdOrder)
      };

    } catch (error) {
      console.error('Create order error:', error);
      return {
        success: false,
        message: 'Order creation failed',
        order: null,
        error: error.message
      };
    }
  }

  async updateOrderStatus(orderId, status, userId) {
    try {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: 'Invalid order status',
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

      if (order.userId !== userId) {
        return {
          success: false,
          message: 'Unauthorized to update this order',
          order: null
        };
      }

      const updatedOrder = await this.orderRepository.update(orderId, { status });

      return {
        success: true,
        message: 'Order status updated successfully',
        order: Order.fromJSON(updatedOrder)
      };

    } catch (error) {
      console.error('Update order status error:', error);
      return {
        success: false,
        message: 'Failed to update order status',
        order: null,
        error: error.message
      };
    }
  }

  async getOrder(orderId, userId) {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          order: null
        };
      }

      if (order.userId !== userId) {
        return {
          success: false,
          message: 'Unauthorized to view this order',
          order: null
        };
      }

      return {
        success: true,
        message: 'Order retrieved successfully',
        order: Order.fromJSON(order)
      };

    } catch (error) {
      console.error('Get order error:', error);
      return {
        success: false,
        message: 'Failed to retrieve order',
        order: null,
        error: error.message
      };
    }
  }

  async getUserOrders(userId, limit = 20, offset = 0) {
    try {
      const orders = await this.orderRepository.findByUserId(userId, limit, offset);

      return {
        success: true,
        message: 'Orders retrieved successfully',
        orders: orders.map(order => Order.fromJSON(order)),
        total: orders.length
      };

    } catch (error) {
      console.error('Get user orders error:', error);
      return {
        success: false,
        message: 'Failed to retrieve orders',
        orders: [],
        total: 0,
        error: error.message
      };
    }
  }

  async validateOrderData(orderData) {
    if (!orderData || !orderData.shippingAddress || !orderData.paymentMethod) {
      return {
        isValid: false,
        message: 'Shipping address and payment method are required'
      };
    }

    if (!orderData.shippingAddress.street || !orderData.shippingAddress.city || !orderData.shippingAddress.zipCode) {
      return {
        isValid: false,
        message: 'Complete shipping address is required'
      };
    }

    return { isValid: true };
  }

  async validateCartStock(cartItems) {
    for (const item of cartItems) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        return {
          isValid: false,
          message: `Product ${item.productId} not found`
        };
      }

      if (product.stock < item.quantity) {
        return {
          isValid: false,
          message: `Insufficient stock for ${product.name}`
        };
      }
    }

    return { isValid: true };
  }

  async updateProductStock(cartItems) {
    for (const item of cartItems) {
      const product = await this.productRepository.findById(item.productId);
      if (product) {
        const newStock = product.stock - item.quantity;
        await this.productRepository.update(item.productId, { stock: newStock });
      }
    }
  }
}
