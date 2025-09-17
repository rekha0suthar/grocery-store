import api from './api.js';

export const paymentService = {
  async getPaymentMethods() {
    const response = await api.get('/payments/methods');
    return response.data;
  },

  async processPayment(paymentData) {
    const response = await api.post('/payments/process', paymentData);
    return response.data;
  },

  async capturePayment(paymentData) {
    const response = await api.post('/payments/capture', paymentData);
    return response.data;
  },

  async refundPayment(paymentData) {
    const response = await api.post('/payments/refund', paymentData);
    return response.data;
  },

  async getPaymentStatus(paymentId) {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
  }
};
