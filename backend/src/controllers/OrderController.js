import { BaseController } from './BaseController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { OrderComposition } from '../composition/OrderComposition.js';

export class OrderController extends BaseController {
  constructor() {
    super();
    this.orderComposition = new OrderComposition();
  }

  createOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderData = req.body;
    
    const order = await this.orderComposition.getCreateOrderUseCase().execute(userId, {
      ...orderData,
      userRole: req.user.role
    });
    
    if (!order.success) {
      return this.sendError(res, order.message, 400);
    }
    
    this.sendSuccess(res, order.order, 'Order created successfully', 201);
  });

  getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, userId } = req.query;
    const offset = (page - 1) * limit;
    
    const orders = await this.orderComposition.getManageOrderUseCase().execute('getAllOrders', {
      page: parseInt(page),
      limit: parseInt(limit),
      offset,
      status,
      userId
    });
    
    this.sendSuccess(res, orders, 'Orders retrieved successfully');
  });

  getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const order = await this.orderComposition.getManageOrderUseCase().execute('getOrderById', { id });
    
    if (!order.success) {
      return this.sendNotFound(res, 'Order not found');
    }
    
    this.sendSuccess(res, order.order, 'Order retrieved successfully');
  });

  getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    const orders = await this.orderComposition.getManageOrderUseCase().execute('getUserOrders', {
      userId,
      page: parseInt(page),
      limit: parseInt(limit),
      offset,
      status
    });
    
    this.sendSuccess(res, orders, 'User orders retrieved successfully');
  });

  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const processedBy = req.user.id;
    
    const order = await this.orderComposition.getManageOrderUseCase().execute('updateOrderStatus', {
      id,
      status,
      processedBy
    });
    
    if (!order.success) {
      return this.sendError(res, order.message, 400);
    }
    
    this.sendSuccess(res, order.order, 'Order status updated successfully');
  });

  getOrderStats = asyncHandler(async (req, res) => {
    const stats = await this.orderComposition.getOrderRepository().getOrderStats();
    this.sendSuccess(res, stats, 'Order statistics retrieved successfully');
  });

  cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const result = await this.orderComposition.getManageOrderUseCase().execute('cancelOrder', {
      orderId: id,
      userId,
      userRole,
      reason
    });
    
    if (!result.success) {
      return this.sendError(res, result.message, 400);
    }
    
    this.sendSuccess(res, result.order, 'Order cancelled successfully');
  });
} 
