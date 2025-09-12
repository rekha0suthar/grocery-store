import { Order, OrderItem } from '../../entities/Order.js';


export class CreateOrderUseCase {
  constructor({ orderRepo, cartRepo, productRepo }) {
    this.orderRepository = orderRepo;
    this.cartRepository = cartRepo;
    this.productRepository = productRepo;
  }

  async execute(userId, orderData) {
    try {
      const userRole = orderData.userRole || 'customer';
      if (!this.canCreateOrder(userRole)) {
        return {
          success: false,
          message: 'Insufficient permissions to create order',
          order: null
        };
      }

      const cartItems = orderData.items || [];
      
      if (!cartItems || cartItems.length === 0) {
        return {
          success: false,
          message: 'Cart is empty',
          order: null
        };
      }

      const validationResult = await this.validateCartItems(cartItems);
      if (!validationResult.isValid) {
        return {
          success: false,
          message: validationResult.message,
          order: null
        };
      }

      const orderItems = await this.createOrderItems(cartItems);

      const finalOrderData = {
        userId: userId,
        items: orderItems,
        status: 'pending',
        totalAmount: orderData.totalAmount || this.calculateTotal(orderItems),
        discountAmount: orderData.discountAmount || 0,
        shippingAmount: orderData.shippingAmount || 0,
        taxAmount: orderData.taxAmount || 0,
        finalAmount: orderData.finalAmount || this.calculateFinalAmount(orderItems, orderData),
        shippingAddress: orderData.shippingAddress || null,
        billingAddress: orderData.billingAddress || null,
        paymentMethod: orderData.paymentMethod || 'cash',
        paymentStatus: orderData.paymentStatus || 'pending',
        notes: orderData.notes || ''
      };

      const order = new Order(finalOrderData);
      const createdOrder = await this.orderRepository.create(order.toJSON());

      const stockReductionResult = await this.reduceStockQuantities(cartItems);
      if (!stockReductionResult.success) {
        console.error('Stock reduction failed:', stockReductionResult.message);
      }

      return {
        success: true,
        message: 'Order created successfully',
        order: createdOrder
      };

    } catch (error) {
      console.error('CreateOrderUseCase error:', error);
      return {
        success: false,
        message: 'Failed to create order',
        order: null
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
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
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
        productPrice: product.price,
        unit: product.unit || 'piece' // Add unit from product or default
      });

      orderItems.push(orderItem.toJSON());
    }

    return orderItems;
  }

  async reduceStockQuantities(cartItems) {
    try {
      const stockReductions = [];

      for (const item of cartItems) {
        const reducedProduct = await this.productRepository.reduceStock(item.productId, item.quantity);
        if (!reducedProduct) {
          return {
            success: false,
            message: `Failed to reduce stock for product ${item.productId}`
          };
        }
        stockReductions.push({
          productId: item.productId,
          quantity: item.quantity,
          newStock: reducedProduct.stock
        });
      }

      return {
        success: true,
        message: 'Stock reduced successfully',
        reductions: stockReductions
      };
    } catch (error) {
      console.error('Stock reduction error:', error);
      return {
        success: false,
        message: 'Failed to reduce stock quantities',
        error: error.message
      };
    }
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
