import { BaseRepository } from './BaseRepository.js';
import { Order } from '@grocery-store/core/entities';

export class OrderRepository extends BaseRepository {
  constructor(databaseAdapter) {
    super('orders', databaseAdapter);
  }

  async create(orderData) {
    const order = new Order(orderData);
    const result = await this.db.create(this.collectionName, order.toJSON());
    return Order.fromJSON(result);
  }

  async findById(id) {
    const result = await this.db.findById(this.collectionName, id);
    return result ? Order.fromJSON(result) : null;
  }

  async findAll(filters = {}, limit = 100, offset = 0) {
    const results = await this.db.findAll(this.collectionName, filters, limit, offset);
    return results.map(order => Order.fromJSON(order));
  }

  async findByUserId(userId, limit = 50, offset = 0) {
    const results = await this.findAll({ userId }, limit, offset);
    return results;
  }

  async findByStatus(status, limit = 50, offset = 0) {
    const results = await this.findAll({ status }, limit, offset);
    return results;
  }

  async updateStatus(id, status, processedBy = null) {
    const updateData = { 
      status, 
      updatedAt: new Date().toISOString() 
    };
    
    if (processedBy) {
      updateData.processedBy = processedBy;
      updateData.processedAt = new Date().toISOString();
    }
    
    const result = await this.db.update(this.collectionName, id, updateData);
    return result ? Order.fromJSON(result) : null;
  }

  async updatePaymentStatus(id, paymentStatus, paymentId = null) {
    const updateData = { 
      paymentStatus, 
      updatedAt: new Date().toISOString() 
    };
    
    if (paymentId) {
      updateData.paymentId = paymentId;
    }
    
    const result = await this.db.update(this.collectionName, id, updateData);
    return result ? Order.fromJSON(result) : null;
  }

  async getOrderStats() {
    const orders = await this.findAll({}, 1000, 0);
    
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.finalAmount, 0)
    };
    
    return stats;
  }
} 
