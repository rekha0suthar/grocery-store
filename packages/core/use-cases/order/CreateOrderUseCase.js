import { Order, OrderItem } from '../../entities/Order.js';

/**
 * Create Order Use Case - Business Logic
 * Handles order creation from cart with validation
 */
export class CreateOrderUseCase {
  /**
   * @param {{ orderRepo: { create(data):Promise<Order> }, cartRepo: { findByUserId(userId):Promise<Cart>, clearCart(id):Promise<void> }, productRepo: { findById(id):Promise<Product> } }} deps
   */
  constructor({ orderRepo, cartRepo, productRepo }) {
    this.orderRepository = orderRepo;
    this.cartRepository = cartRepo;
    this.productRepository = productRepo;
  }

  async execute(userId, orderData = {}) {
    try {
      // Input validation
      if (!userId) {
        return {
          success: false,
          message: 'Cart not found',
          order: null
        };
      }

      // Authorization check - assume customer role if not specified
      const userRole = orderData.userRole || 'customer';
      if (!this.canCreateOrder(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to create order',
          order: null
        };
      }

      // Get cart by user ID
      const cart = await this.cartRepository.findByUserId(userId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          order: null
        };
      }

      // Validate cart has items
      if (!cart.items || cart.items.length === 0) {
        return {
          success: false,
          message: 'Cart is empty',
          order: null
        };
      }

      // Validate all products exist and have sufficient stock
      const validationResult = await this.validateCartItems(cart.items);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message,
          order: null
        };
      }

      // Create order items
      const orderItems = await this.createOrderItems(cart.items);

      // Create order with data from cart and orderData
      const finalOrderData = {
        userId: userId,
        items: orderItems,
        status: 'pending',
        totalAmount: orderData.totalAmount || this.calculateTotal(orderItems),
        discountAmount: orderData.discountAmount || 0,
        shippingAmount: orderData.shippingAmount || 0,
        taxAmount: orderData.taxAmount || 0,
        finalAmount: orderData.finalAmount || this.calculateFinalAmount(orderItems, orderData),
        shippingAddress: orderData.shippingAddress || cart.shippingAddress || null,
        billingAddress: orderData.billingAddress || cart.billingAddress || null,
        paymentMethod: orderData.paymentMethod || cart.paymentMethod || 'cash',
        notes: orderData.notes || ''
      };

      const order = new Order(finalOrderData);
      const createdOrder = await this.orderRepository.create(order.toJSON());

      // Clear cart after successful order creation
      await this.cartRepository.clear(cart.id);

      return {
        success: true,
        message: 'Order created successfully',
        order: Order.fromJSON(createdOrder)
      };

    } catch (error) {
      console.error('CreateOrderUseCase error:', error);
      return {
        success: false,
        message: 'Failed to create order',
        order: null,
        error: error.message
      };
    }
  }

  canCreateOrder(userRole) {
    return ['customer', 'admin', 'store_manager'].includes(userRole);
  }

  async validateCartItems(cartItems) {
    for (const item of cartItems) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        return {
          isValid: false,
          message: `Product not found`
        };
      }

      if (!product.isAvailable || !product.isVisible) {
        return {
          isValid: false,
          message: `Product ${product.name} is not available`
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

  async createOrderItems(cartItems) {
    const orderItems = [];

    for (const item of cartItems) {
      const product = await this.productRepository.findById(item.productId);

      const orderItem = new OrderItem({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity
      });

      orderItems.push(orderItem.toJSON());
    }

    return orderItems;
  }

  calculateTotal(orderItems) {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  calculateFinalAmount(orderItems, orderData) {
    const subtotal = this.calculateTotal(orderItems);
    const shipping = orderData.shippingAmount || 0;
    const tax = orderData.taxAmount || 0;
    const discount = orderData.discountAmount || 0;
    return Math.max(0, subtotal + shipping + tax - discount);
  }
}
