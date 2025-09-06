import { OrderRepository } from '../../repositories/OrderRepository.js';
import { CartRepository } from '../../repositories/CartRepository.js';
import { ProductRepository } from '../../repositories/ProductRepository.js';
import { Order } from '../../entities/Order.js';
import { OrderItem } from '../../entities/OrderItem.js';
import appConfig from '../../config/appConfig.js';

/**
 * Create Order Use Case - Business Logic
 * Handles order creation from cart with validation
 */
export class CreateOrderUseCase {
  constructor() {
    this.orderRepository = new OrderRepository(appConfig.getDatabaseType());
    this.cartRepository = new CartRepository(appConfig.getDatabaseType());
    this.productRepository = new ProductRepository(appConfig.getDatabaseType());
  }

  async execute(userId, orderData) {
    try {
      // Input validation
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required',
          order: null
        };
      }

      // Get user's cart
      const cartData = await this.cartRepository.findByUserId(userId);
      if (!cartData) {
        return {
          success: false,
          message: 'Cart is empty',
          order: null
        };
      }

      const cart = Cart.fromJSON(cartData);
      if (cart.isEmpty()) {
        return {
          success: false,
          message: 'Cart is empty',
          order: null
        };
      }

      // Validate cart items and stock
      const stockValidation = await this.validateStock(cart.items);
      if (!stockValidation.isValid) {
        return {
          success: false,
          message: stockValidation.message,
          order: null
        };
      }

      // Create order items
      const orderItems = cart.items.map(cartItem => {
        return new OrderItem({
          productId: cartItem.productId,
          productName: cartItem.productName,
          productPrice: cartItem.productPrice,
          quantity: cartItem.quantity,
          unit: cartItem.unit,
          totalPrice: cartItem.getTotalPrice()
        });
      });

      // Create order
      const order = new Order({
        userId,
        items: orderItems,
        totalAmount: cart.totalAmount,
        discountAmount: cart.discountAmount,
        shippingAmount: orderData.shippingAmount || 0,
        taxAmount: orderData.taxAmount || 0,
        shippingAddress: orderData.shippingAddress || cart.shippingAddress,
        billingAddress: orderData.billingAddress || cart.billingAddress,
        paymentMethod: orderData.paymentMethod || cart.paymentMethod,
        notes: orderData.notes || cart.notes
      });

      // Calculate final amount
      order.calculateFinalAmount();

      // Save order
      const createdOrder = await this.orderRepository.create(order.toJSON());

      // Update product stock
      await this.updateProductStock(cart.items);

      // Clear cart
      await this.cartRepository.delete(cart.id);

      return {
        success: true,
        message: 'Order created successfully',
        order: Order.fromJSON(createdOrder)
      };

    } catch (error) {
      console.error('Order creation error:', error);
      return {
        success: false,
        message: 'Order creation failed',
        order: null,
        error: error.message
      };
    }
  }

  async validateStock(cartItems) {
    for (const item of cartItems) {
      const productData = await this.productRepository.findById(item.productId);
      if (!productData) {
        return {
          isValid: false,
          message: `Product "${item.productName}" is no longer available`
        };
      }

      const product = Product.fromJSON(productData);
      if (product.stock < item.quantity) {
        return {
          isValid: false,
          message: `Insufficient stock for "${item.productName}". Available: ${product.stock}, Requested: ${item.quantity}`
        };
      }
    }

    return { isValid: true };
  }

  async updateProductStock(cartItems) {
    for (const item of cartItems) {
      await this.productRepository.updateStock(item.productId, item.quantity, 'subtract');
    }
  }
}
