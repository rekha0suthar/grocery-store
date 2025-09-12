import { CreateOrderUseCase, ProcessOrderUseCase } from '@grocery-store/core/use-cases/order';
import { CancelOrderUseCase } from '@grocery-store/core/use-cases/order';
import { OrderRepository } from '../repositories/OrderRepository.js';
import { CartRepository } from '../repositories/CartRepository.js';
import { ProductRepository } from '../repositories/ProductRepository.js';
import appConfig from '../config/appConfig.js';
import { DatabaseFactory } from '../factories/DatabaseFactory.js';

export class OrderComposition {
  constructor() {
    const databaseAdapter = DatabaseFactory.createAdapter(appConfig.getDatabaseType());
    
    this.orderRepository = new OrderRepository(databaseAdapter);
    this.cartRepository = new CartRepository(databaseAdapter);
    this.productRepository = new ProductRepository(databaseAdapter);
    
    this.createOrderUseCase = new CreateOrderUseCase({
      orderRepo: this.orderRepository,
      cartRepo: this.cartRepository,
      productRepo: this.productRepository
    });
    
    this.processOrderUseCase = new ProcessOrderUseCase({
      orderRepo: this.orderRepository
    });

    this.cancelOrderUseCase = new CancelOrderUseCase({
      orderRepo: this.orderRepository,
      productRepo: this.productRepository
    });
  }

  getCreateOrderUseCase() {
    return this.createOrderUseCase;
  }

  getProcessOrderUseCase() {
    return this.processOrderUseCase;
  }

  getCancelOrderUseCase() {
    return this.cancelOrderUseCase;
  }

  getOrderRepository() {
    return this.orderRepository;
  }

  getManageOrderUseCase() {
    return {
      execute: async (operation, data) => {
        switch (operation) {
          case 'getAllOrders':
            const orders = await this.orderRepository.findAll({}, data.limit, data.offset);
            return { success: true, orders };
          case 'getOrderById':
            const order = await this.orderRepository.findById(data.id);
            return { success: !!order, order };
          case 'getUserOrders':
            const userOrders = await this.orderRepository.findByUserId(data.userId, data.limit, data.offset);
            return { success: true, orders: userOrders };
          case 'updateOrderStatus':
            const updatedOrder = await this.orderRepository.updateStatus(data.id, data.status, data.processedBy);
            return { success: !!updatedOrder, order: updatedOrder };
          case 'cancelOrder':
            return await this.cancelOrderUseCase.execute(data.orderId, data.userId, data.userRole, data.reason);
          default:
            return { success: false, message: 'Unknown operation' };
        }
      }
    };
  }
} 
