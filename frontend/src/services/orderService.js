import api from './api.js';

export const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response;
  },

  async getUserOrders(params = {}) {
    const response = await api.get('/orders/my-orders', { params });
    return response;
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response;
  },

  async getAllOrders(params = {}) {
    const response = await api.get('/orders', { params });
    return response;
  },

  async updateOrderStatus(id, status) {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response;
  },

  async getOrderStats() {
    const response = await api.get('/orders/stats/overview');
    return response;
  },

  async cancelOrder(id, reason) {
    const response = await api.put(`/orders/${id}/cancel`, { reason });
    return response;
  },

  async getOrders() {
    const response = await api.get('/orders');
    return response;
  },

  async updateOrder(id, orderData) {
    const response = await api.put(`/orders/${id}`, orderData);
    return response;
  },

  async getOrderHistory() {
    const response = await api.get('/orders/history');
    return response;
  }
};
